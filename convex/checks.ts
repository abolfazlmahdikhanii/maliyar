import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { applyToBalance } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { isValidDate, todayTehran } from "./lib/date";
import { checkFields } from "./schema";

// ⚠️ این key باید در data file دسته‌بندی‌ها وجود داشته باشه
const CHECK_CATEGORY_ID = "check";
const CHECK_PAYMENT_METHOD = "check";

async function getOwnedCheck(
  ctx: MutationCtx,
  userId: Id<"users">,
  id: Id<"checks">,
) {
  const check = await ctx.db.get(id);
  if (!check || check.userId !== userId) throw new ConvexError("چک یافت نشد.");
  return check;
}

// اعتبارسنجی سمت سرور
function normalize<
  T extends {
    amount: number;
    serial: string;
    party: string;
    issueDate: string;
    dueDate: string;
  },
>(input: T): T {
  const serial = input.serial.trim();
  const party = input.party.trim();

  if (!Number.isInteger(input.amount) || input.amount <= 0)
    throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  if (!serial) throw new ConvexError("شماره سریال را وارد کن.");
  if (serial.length > 30)
    throw new ConvexError("شماره سریال نباید بیشتر از ۳۰ کاراکتر باشد.");
  if (!party) throw new ConvexError("نام طرف حساب را وارد کن.");
  if (party.length > 100)
    throw new ConvexError("نام طرف حساب نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  if (!isValidDate(input.issueDate))
    throw new ConvexError("تاریخ صدور معتبر نیست.");
  if (!isValidDate(input.dueDate))
    throw new ConvexError("تاریخ سررسید معتبر نیست.");
  // فرمت YYYY-MM-DD را می‌شود مستقیم با < مقایسه کرد
  if (input.dueDate < input.issueDate)
    throw new ConvexError("سررسید نمی‌تواند قبل از تاریخ صدور باشد.");

  return { ...input, serial, party };
}

async function assertSerialUnique(
  ctx: MutationCtx,
  userId: Id<"users">,
  bank: string,
  serial: string,
  exceptId?: Id<"checks">,
) {
  const dup = await ctx.db
    .query("checks")
    .withIndex("by_user_bank_serial", (q) =>
      q.eq("userId", userId).eq("bank", bank).eq("serial", serial),
    )
    .first();
  if (dup && dup._id !== exceptId)
    throw new ConvexError("این شماره سریال قبلاً برای این بانک ثبت شده.");
}

// اثر وصول را برمی‌گرداند: تراکنش حذف و موجودی حساب به حالت قبل برمی‌گردد
async function undoClearing(ctx: MutationCtx, check: Doc<"checks">) {
  if (!check.paymentTransactionId) return;
  const transaction = await ctx.db.get(check.paymentTransactionId);
  // اگر تراکنش قبلا از بین رفته باشد، چیزی برای برگرداندن نیست
  if (!transaction) return;

  await applyToBalance(
    ctx,
    transaction.accountId,
    transaction.type,
    transaction.amount,
    true,
  );
  await ctx.db.delete(transaction._id);
}

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("cleared"), v.literal("bounced")),
    ),
    direction: v.optional(v.union(v.literal("issued"), v.literal("received"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const checks = await ctx.db
      .query("checks")
      .withIndex("by_user_due", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return checks.filter(
      (c) =>
        (!args.status || c.status === args.status) &&
        (!args.direction || c.direction === args.direction),
    );
  },
});

export const create = mutation({
  args: checkFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = normalize(args);
    await assertSerialUnique(ctx, userId, data.bank, data.serial);
    return ctx.db.insert("checks", { ...data, userId, status: "pending" });
  },
});

export const update = mutation({
  args: { id: v.id("checks"), ...checkFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const check = await getOwnedCheck(ctx, userId, id);
    if (check.status !== "pending")
      throw new ConvexError("فقط چک‌های در انتظار قابل ویرایش‌اند.");

    const data = normalize(fields);
    await assertSerialUnique(ctx, userId, data.bank, data.serial, id);
    await ctx.db.patch(id, data);
  },
});

// ثبت وصول: تراکنش ساخته و موجودی حساب تغییر می‌کنه.
// دریافتی → درآمد، پرداختی → هزینه. تراکنش از صفحه‌ی تراکنش‌ها قفله (source: "check")
export const markCleared = mutation({
  args: {
    id: v.id("checks"),
    accountId: v.id("accounts"),
    date: v.string(), // تاریخ وصول، میلادی YYYY-MM-DD
  },
  handler: async (ctx, { id, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");
    if (date > todayTehran())
      throw new ConvexError("تاریخ وصول نمی‌تواند در آینده باشد.");

    const check = await getOwnedCheck(ctx, userId, id);

    if (check.status !== "pending")
      throw new ConvexError("این چک قبلاً نهایی شده.");
    if (date < check.issueDate)
      throw new ConvexError("تاریخ وصول نمی‌تواند قبل از تاریخ صدور باشد.");

    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId)
      throw new ConvexError("حساب پیدا نشد.");
    if (account.type === "wallet") {
      throw new ConvexError("چک فقط با حساب بانکی قابل ثبت است.");
    }
    if (check.direction === "issued" && account.bank !== check.bank) {
      throw new ConvexError("چک پرداختی باید از حساب همان بانک پرداخت شود.");
    }
    const type = check.direction === "received" ? "income" : "outcome";
    if (type === "outcome" && account.balance < check.amount)
      throw new ConvexError("موجودی حساب کافی نیست.");

    const paymentTransactionId = await ctx.db.insert("transactions", {
      userId,
      accountId,
      type,
      amount: check.amount,
      title: `چک ${check.serial} - ${check.party}`,
      categoryId: type === "income" ? "check-income" : "check-outcome",
      paymentMethod: account.type, // مثل وام و بدهی؛ نه "check"
      date,
      source: "check",
    });

    await applyToBalance(ctx, accountId, type, check.amount);
    await ctx.db.patch(id, {
      status: "cleared",
      clearedAt: date,
      accountId,
      paymentTransactionId,
    });
  },
});

export const markBounced = mutation({
  args: { id: v.id("checks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const check = await getOwnedCheck(ctx, userId, id);
    if (check.status !== "pending")
      throw new ConvexError("این چک قبلاً نهایی شده.");
    await ctx.db.patch(id, { status: "bounced" });
  },
});

// برگشت به «در انتظار»
export const revert = mutation({
  args: { id: v.id("checks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const check = await getOwnedCheck(ctx, userId, id);
    if (check.status === "pending") return;

    if (check.status === "cleared") await undoClearing(ctx, check);
    await ctx.db.patch(id, {
      status: "pending",
      clearedAt: undefined,
      accountId: undefined,
      paymentTransactionId: undefined,
    });
  },
});

// حذف چک: اگه وصول شده بود، تراکنش و اثر موجودی هم برمی‌گرده
export const remove = mutation({
  args: { id: v.id("checks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const check = await getOwnedCheck(ctx, userId, id);
    if (check.status === "cleared") await undoClearing(ctx, check);
    await ctx.db.delete(id);
  },
});

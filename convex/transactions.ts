import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { applyToBalance } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { isValidDate } from "./lib/date";
import { transactionFields } from "./schema";

const transactionObject = v.object(transactionFields);
type TransactionInput = Infer<typeof transactionObject>;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// درآمد: مثبت، هزینه: منفی
const signedAmount = (t: { type: "income" | "outcome"; amount: number }) =>
  t.type === "income" ? t.amount : -t.amount;

// تراکنش‌هایی که از وام، بدهی و طلب یا چک ساخته شده‌اند (source دارند) از اینجا
// قابل ویرایش و حذف نیستند؛ فقط از صفحه‌ی خودشان برمی‌گردند
const LOCKED_MESSAGES = {
  loan: "این تراکنش مربوط به قسط وام است؛ از صفحه‌ی وام قابل برگشت است.",
  dues: "این تراکنش مربوط به بدهی یا طلب است؛ از صفحه‌ی بدهی و طلب قابل حذف است.",
  check: "این تراکنش مربوط به چک است؛ از صفحه‌ی چک‌ها قابل برگشت است.",
} as const;

function assertNotLocked(transaction: Doc<"transactions">) {
  if (transaction.source) throw new ConvexError(LOCKED_MESSAGES[transaction.source]);
}

function assertSufficientBalance(
  available: number,
  t: { type: "income" | "outcome"; amount: number },
) {
  if (t.type === "outcome" && available < t.amount) {
    throw new ConvexError("موجودی حساب کافی نیست.");
  }
}

// اعتبارسنجی سمت سرور + حذف فیلدهای خالی + چک مالکیت حساب
async function normalize(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: TransactionInput,
): Promise<{ data: TransactionInput; account: Doc<"accounts"> }> {
  const { title, note, time, ...rest } = input;

  if (!Number.isInteger(rest.amount) || rest.amount <= 0) {
    throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (!isValidDate(rest.date)) throw new ConvexError("تاریخ معتبر نیست.");
  if (time && !TIME_RE.test(time)) throw new ConvexError("ساعت معتبر نیست.");

  const cleanTitle = title?.trim();
  const cleanNote = note?.trim();
  if (cleanTitle && cleanTitle.length > 100) {
    throw new ConvexError("عنوان نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  }
  if (cleanNote && cleanNote.length > 500) {
    throw new ConvexError("یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد.");
  }

  const account = await ctx.db.get(rest.accountId);
  if (!account || account.userId !== userId) {
    throw new ConvexError("حساب پیدا نشد.");
  }

  return {
    data: {
      ...rest,
      ...(cleanTitle ? { title: cleanTitle } : {}),
      ...(cleanNote ? { note: cleanNote } : {}),
      ...(time ? { time } : {}),
    },
    account,
  };
}

export const list = query({
  // from و to: میلادی YYYY-MM-DD، شامل هر دو سر. کلاینت ماه شمسی را به این بازه تبدیل می‌کند
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!isValidDate(from) || !isValidDate(to) || from > to) {
      throw new ConvexError("بازه‌ی تاریخ معتبر نیست.");
    }

    // فقط تراکنش‌های همین بازه خوانده می‌شود، نه همه‌ی تراکنش‌ها
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", from).lte("date", to),
      )
      .order("desc")
      .collect();

    // هر حساب فقط یک بار خوانده می‌شود
    const accountIds = [...new Set(transactions.map((t) => t.accountId))];
    const accounts = await Promise.all(accountIds.map((id) => ctx.db.get(id)));

    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

    // bank: کلید بانک (مثل "mellat" یا "cash")؛ اگر حساب حذف شده باشد null.
    // source: "loan" | "dues" | "check" یعنی تراکنش قفل است
    return transactions.map((t) => ({
      ...t,
      bank: bankById.get(t.accountId) ?? null,
    }));
  },
});

export const add = mutation({
  args: transactionFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const { data, account } = await normalize(ctx, userId, args);
    assertSufficientBalance(account.balance, data);

    const id = await ctx.db.insert("transactions", { ...data, userId });
    await applyToBalance(ctx, data.accountId, data.type, data.amount);
    return id;
  },
});

export const update = mutation({
  args: { id: v.id("transactions"), ...transactionFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("تراکنش پیدا نشد.");
    }
    assertNotLocked(existing);

    const { data, account } = await normalize(ctx, userId, fields);

    // اگر حساب عوض نشده، اثر تراکنش قبلی هم باید در موجودی در دسترس حساب شود
    const available =
      existing.accountId === data.accountId
        ? account.balance - signedAmount(existing)
        : account.balance;
    assertSufficientBalance(available, data);

    // replace: اگر عنوان، یادداشت یا ساعت پاک شد، از دیتابیس هم پاک شود
    await ctx.db.replace(id, { ...data, userId });

    // اثر تراکنش قبلی را برگردان، اثر جدید را اعمال کن (حساب ممکن است عوض شده باشد)
    await applyToBalance(ctx, existing.accountId, existing.type, existing.amount, true);
    await applyToBalance(ctx, data.accountId, data.type, data.amount);
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ConvexError("تراکنش پیدا نشد.");
    }
    assertNotLocked(existing);

    await ctx.db.delete(id);
    await applyToBalance(ctx, existing.accountId, existing.type, existing.amount, true);
  },
});
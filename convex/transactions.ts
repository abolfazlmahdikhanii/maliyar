import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { transactionFields } from "./schema";

const transactionObject = v.object(transactionFields);
type TransactionInput = Infer<typeof transactionObject>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("لطفا وارد حساب شو.");
  return userId;
}

// درآمد: مثبت، هزینه: منفی
const signedAmount = (t: { type: "income" | "outcome"; amount: number }) =>
  t.type === "income" ? t.amount : -t.amount;

// موجودی حساب را تغییر می‌دهد. چون mutation اتمی است، موجودی و تراکنش
// همیشه با هم ذخیره می‌شوند یا هیچ‌کدام
async function adjustBalance(
  ctx: MutationCtx,
  accountId: Id<"accounts">,
  delta: number,
) {
  if (delta === 0) return;
  const account = await ctx.db.get(accountId);
  if (!account) return;
  await ctx.db.patch(accountId, { balance: account.balance + delta });
}

// اعتبارسنجی سمت سرور + حذف فیلدهای خالی + چک مالکیت حساب
async function normalize(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: TransactionInput,
): Promise<TransactionInput> {
  const { title, note, time, ...rest } = input;

  if (!Number.isInteger(rest.amount) || rest.amount <= 0) {
    throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (!DATE_RE.test(rest.date) || Number.isNaN(Date.parse(rest.date))) {
    throw new ConvexError("تاریخ معتبر نیست.");
  }
  if (time && !TIME_RE.test(time)) {
    throw new ConvexError("ساعت معتبر نیست.");
  }

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
    ...rest,
    ...(cleanTitle ? { title: cleanTitle } : {}),
    ...(cleanNote ? { note: cleanNote } : {}),
    ...(time ? { time } : {}),
  };
}

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);

    // هر حساب فقط یک بار خوانده می‌شود، نه یک بار برای هر تراکنش
    const accountIds = [...new Set(transactions.map((t) => t.accountId))];
    const accounts = await Promise.all(accountIds.map((id) => ctx.db.get(id)));

    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

    // bank: کلید بانک (مثل "mellat" یا "cash")؛ اگر حساب حذف شده باشد null
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
    const data = await normalize(ctx, userId, args);

    const id = await ctx.db.insert("transactions", { ...data, userId });
    await adjustBalance(ctx, data.accountId, signedAmount(data));
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

    const data = await normalize(ctx, userId, fields);

    // replace: اگر عنوان، یادداشت یا ساعت پاک شد، از دیتابیس هم پاک شود
    await ctx.db.replace(id, { ...data, userId });

    // اثر تراکنش قبلی را برگردان، اثر جدید را اعمال کن (حساب ممکن است عوض شده باشد)
    await adjustBalance(ctx, existing.accountId, -signedAmount(existing));
    await adjustBalance(ctx, data.accountId, signedAmount(data));
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

    await ctx.db.delete(id);
    await adjustBalance(ctx, existing.accountId, -signedAmount(existing));
  },
});
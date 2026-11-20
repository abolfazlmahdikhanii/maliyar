import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { daysAgoTehran } from "./lib/date";
import { accountFields } from "./schema";

const accountObject = v.object(accountFields);
type AccountInput = Infer<typeof accountObject>;

const STATS_DAYS = 30;

const normalize = (input: AccountInput): AccountInput => {
  const { cardNumber, iban, bank, ...rest } = input;

  if (!Number.isInteger(rest.initialBalance) || rest.initialBalance < 0) {
    throw new ConvexError("موجودی اولیه باید عدد صحیح و غیرمنفی باشد.");
  }

  if (rest.type === "wallet") return { ...rest, bank: "cash" };

  if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
    throw new ConvexError("شماره کارت باید ۱۶ رقم باشد.");
  }
  if (iban && !/^\d{24}$/.test(iban)) {
    throw new ConvexError("شماره شبا باید ۲۴ رقم باشد.");
  }

  const cleanBank = bank.trim();
  if (!cleanBank) throw new ConvexError("نام بانک مشخص نیست.");

  return { ...rest, bank: cleanBank, cardNumber, iban };
};

async function assertNoDuplicate(
  ctx: MutationCtx,
  userId: Id<"users">,
  data: AccountInput,
  excludeId?: Id<"accounts">,
) {
  const userAccounts = await ctx.db
    .query("accounts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const others = userAccounts.filter((a) => a._id !== excludeId);

  if (data.type === "wallet") {
    if (others.some((a) => a.type === "wallet")) {
      throw new ConvexError("کیف پول قبلاً ساخته شده و فقط یکی مجاز است.");
    }
    return;
  }

  if (data.cardNumber && others.some((a) => a.cardNumber === data.cardNumber)) {
    throw new ConvexError("حسابی با این شماره کارت قبلاً ثبت شده است.");
  }
  if (data.iban && others.some((a) => a.iban === data.iban)) {
    throw new ConvexError("حسابی با این شماره شبا قبلاً ثبت شده است.");
  }
}

function summarize(transactions: Doc<"transactions">[], since?: string) {
  let totalIncome = 0;
  let totalOutcome = 0;
  let transactionCount = 0;
  for (const t of transactions) {
    if (since !== undefined && t.date < since) continue;
    transactionCount++;
    if (t.type === "income") totalIncome += t.amount;
    else totalOutcome += t.amount;
  }
  return { totalIncome, totalOutcome, transactionCount };
}

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const since = daysAgoTehran(STATS_DAYS);

    const recent = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", since),
      )
      .collect();

    const byAccount = new Map<string, Doc<"transactions">[]>();
    for (const t of recent) {
      const bucket = byAccount.get(t.accountId);
      if (bucket) bucket.push(t);
      else byAccount.set(t.accountId, [t]);
    }

    return accounts.map((account) => ({
      ...account,
      ...summarize(byAccount.get(account._id) ?? []),
    }));
  },
});

export const get = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const account = await ctx.db.get(id);
    if (!account || account.userId !== userId) return null;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", id))
      .collect();

    transactions.sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        (b.time ?? "").localeCompare(a.time ?? ""),
    );

    return {
      ...account,
      ...summarize(transactions, daysAgoTehran(STATS_DAYS)),
      transactions,
    };
  },
});

export const add = mutation({
  args: accountFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = normalize(args);
    await assertNoDuplicate(ctx, userId, data);

    return ctx.db.insert("accounts", {
      ...data,
      userId,
      balance: data.initialBalance,
    });
  },
});

export const update = mutation({
  args: { id: v.id("accounts"), ...accountFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const account = await ctx.db.get(id);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }
    if (account.type === "card") {
      const userAccounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const hasOtherSameBank = userAccounts.some(
        (a) => a._id !== id && a.type === "card" && a.bank === account.bank,
      );

      if (!hasOtherSameBank) {
        const pendingIssued = await ctx.db
          .query("checks")
          .withIndex("by_user_due", (q) => q.eq("userId", userId))
          .filter((q) =>
            q.and(
              q.eq(q.field("status"), "pending"),
              q.eq(q.field("direction"), "issued"),
              q.eq(q.field("bank"), account.bank),
            ),
          )
          .first();
        if (pendingIssued) {
          throw new ConvexError(
            "یک چک پرداختی در انتظار روی این بانک وجود دارد؛ اول آن را نهایی یا حذف کن.",
          );
        }
      }
    }
    const data = normalize(fields);
    await assertNoDuplicate(ctx, userId, data, id);

    const delta = data.initialBalance - account.initialBalance;
    const balance = account.balance + delta;
    if (delta < 0 && balance < 0) {
      throw new ConvexError(
        "با این موجودی اولیه، موجودی فعلی حساب منفی می‌شود.",
      );
    }

    await ctx.db.replace(id, { ...data, userId, balance });
  },
});

export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const account = await ctx.db.get(id);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }
    if (account.type === "card") {
      const userAccounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const hasOtherSameBank = userAccounts.some(
        (a) => a._id !== id && a.type === "card" && a.bank === account.bank,
      );

      if (!hasOtherSameBank) {
        const pendingIssued = await ctx.db
          .query("checks")
          .withIndex("by_user_due", (q) => q.eq("userId", userId))
          .filter((q) =>
            q.and(
              q.eq(q.field("status"), "pending"),
              q.eq(q.field("direction"), "issued"),
              q.eq(q.field("bank"), account.bank),
            ),
          )
          .first();
        if (pendingIssued) {
          throw new ConvexError(
            "یک چک پرداختی در انتظار روی این بانک وجود دارد؛ اول آن را نهایی یا حذف کن.",
          );
        }
      }
    }

    const used = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", id))
      .first();
    if (used) {
      throw new ConvexError("این حساب تراکنش دارد؛ اول تراکنش‌هایش را حذف کن.");
    }

    await ctx.db.delete(id);
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { applyToBalance, reverseTransaction } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { isValidDate, todayTehran } from "./lib/date";
import { duesFields } from "./schema";

const duesObject = v.object(duesFields);
type DuesInput = Infer<typeof duesObject>;

const normalize = (input: DuesInput): DuesInput => {
  const { party, reason, ...rest } = input;

  if (!Number.isInteger(rest.amount) || rest.amount <= 0) {
    throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (!isValidDate(rest.dueDate)) {
    throw new ConvexError("تاریخ سررسید معتبر نیست.");
  }

  const cleanParty = party.trim();
  if (!cleanParty) throw new ConvexError("طرف حساب را وارد کن.");
  if (cleanParty.length > 100) {
    throw new ConvexError("نام طرف حساب نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  }

  const cleanReason = reason?.trim();
  if (cleanReason && cleanReason.length > 500) {
    throw new ConvexError("توضیح نباید بیشتر از ۵۰۰ کاراکتر باشد.");
  }

  return {
    ...rest,
    party: cleanParty,
    ...(cleanReason ? { reason: cleanReason } : {}),
  };
};

async function getOwnedDue(
  ctx: MutationCtx,
  userId: Id<"users">,
  id: Id<"dues">,
) {
  const due = await ctx.db.get(id);
  if (!due || due.userId !== userId) throw new ConvexError("مورد پیدا نشد.");
  return due;
}

//
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const dues = await ctx.db
      .query("dues")
      .withIndex("by_user_status_due", (q) => q.eq("userId", userId))
      .collect();

    const accountIds = [
      ...new Set(
        dues
          .map((d) => d.accountId)
          .filter((id): id is Id<"accounts"> => id !== undefined),
      ),
    ];
    const accounts = await Promise.all(accountIds.map((id) => ctx.db.get(id)));

    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

    return dues.map((d) => ({
      ...d,
      bank:
        d.status === "paid" && d.accountId
          ? (bankById.get(d.accountId) ?? "unknown")
          : "unknown",
    }));
  },
});

export const add = mutation({
  args: duesFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return ctx.db.insert("dues", {
      ...normalize(args),
      userId,
      status: "open",
    });
  },
});

export const update = mutation({
  args: { id: v.id("dues"), ...duesFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const due = await getOwnedDue(ctx, userId, id);
    if (due.status === "paid") {
      throw new ConvexError("مورد تسویه‌شده قابل ویرایش نیست.");
    }

    const data = normalize(fields);
    await ctx.db.patch(id, { ...data, reason: data.reason });
  },
});

export const markPaid = mutation({
  args: {
    id: v.id("dues"),
    accountId: v.id("accounts"),
    date: v.string(), 
  },
  handler: async (ctx, { id, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");
    if (date > todayTehran()) {
      throw new ConvexError("تاریخ پرداخت نمی‌تواند در آینده باشد.");
    }

    const due = await getOwnedDue(ctx, userId, id);
    if (due.status === "paid") {
      throw new ConvexError("این مورد قبلا تسویه شده است.");
    }

    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }

    const isDebt = due.type === "debt";
    const type = isDebt ? "outcome" : "income";

    if (isDebt && account.balance < due.amount) {
      throw new ConvexError("موجودی حساب کافی نیست.");
    }

    const paymentTransactionId = await ctx.db.insert("transactions", {
      userId,
      type,
      amount: due.amount,
      title: `${isDebt ? "پرداخت بدهی به" : "دریافت طلب از"} ${due.party}`,
      categoryId: isDebt ? "debt" : "claim",
      accountId,
      paymentMethod: account.type,
      date,
      ...(due.reason ? { note: due.reason } : {}),
      source: "dues",
    });

    await applyToBalance(ctx, accountId, type, due.amount);
    await ctx.db.patch(id, {
      status: "paid",
      paidAt: date,
      accountId,
      paymentTransactionId,
    });

    return paymentTransactionId;
  },
});

export const remove = mutation({
  args: { id: v.id("dues") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const due = await getOwnedDue(ctx, userId, id);

    if (due.paymentTransactionId) {
      await reverseTransaction(ctx, due.paymentTransactionId);
    }
    await ctx.db.delete(id);
  },
});
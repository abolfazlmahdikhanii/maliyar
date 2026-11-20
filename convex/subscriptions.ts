import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { applyToBalance } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { daysAheadTehran, isValidDate, todayTehran } from "./lib/date";
import {
  advanceDate,
  jalaliDay,
  previousDate,
} from "./lib/subscriptionSchedule";
import { subscriptionFields } from "./schema";

const subscriptionObject = v.object(subscriptionFields);
type SubscriptionInput = Infer<typeof subscriptionObject>;

async function normalize(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: SubscriptionInput,
): Promise<SubscriptionInput> {
  const name = input.name.trim();
  if (!name) throw new ConvexError("نام اشتراک را وارد کن.");
  if (name.length > 100) {
    throw new ConvexError("نام اشتراک نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  }
  if (!input.categoryId.trim()) throw new ConvexError("دسته را انتخاب کن.");
  if (
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0 ||
    input.amount > 1_000_000_000_000
  ) {
    throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (!isValidDate(input.nextPaymentDate)) {
    throw new ConvexError("تاریخ پرداخت بعدی معتبر نیست.");
  }

  if (input.accountId) {
    const account = await ctx.db.get(input.accountId);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }
  }

  return { ...input, name };
}

async function getOwned(
  ctx: MutationCtx,
  userId: Id<"users">,
  id: Id<"subscriptions">,
) {
  const sub = await ctx.db.get(id);
  if (!sub || sub.userId !== userId) {
    throw new ConvexError("اشتراک پیدا نشد.");
  }
  return sub;
}

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const [subs, accounts] = await Promise.all([
      ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),

      ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const bankById = new Map(
      accounts.map((account) => [account._id, account.bank]),
    );

    return subs
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active" ? -1 : 1;
        return a.nextPaymentDate.localeCompare(b.nextPaymentDate);
      })
      .map((s) => ({
        ...s,
        bank: s.accountId ? (bankById.get(s.accountId) ?? null) : null,
        previousPaymentDate: previousDate(
          s.nextPaymentDate,
          s.cycle,
          s.anchorDay,
        ),
      }));
  },
});

export const add = mutation({
  args: subscriptionFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = await normalize(ctx, userId, args);

    return ctx.db.insert("subscriptions", {
      ...data,
      userId,
      anchorDay: jalaliDay(data.nextPaymentDate),
    });
  },
});

export const update = mutation({
  args: { id: v.id("subscriptions"), ...subscriptionFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);

    const [sub, data] = await Promise.all([
      getOwned(ctx, userId, id),
      normalize(ctx, userId, fields),
    ]);

    await ctx.db.patch(id, {
      ...data,
      accountId: data.accountId,
      anchorDay:
        data.nextPaymentDate === sub.nextPaymentDate
          ? sub.anchorDay
          : jalaliDay(data.nextPaymentDate),
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("subscriptions"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, { id, status }) => {
    const userId = await requireUserId(ctx);
    await getOwned(ctx, userId, id);
    await ctx.db.patch(id, { status });
  },
});

export const markPaid = mutation({
  args: {
    id: v.id("subscriptions"),
    accountId: v.optional(v.id("accounts")),
    date: v.string(),
  },
  handler: async (ctx, { id, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");
    if (date > todayTehran()) {
      throw new ConvexError("تاریخ پرداخت نمی‌تواند در آینده باشد.");
    }

    const sub = await getOwned(ctx, userId, id);
    if (sub.status === "inactive") {
      throw new ConvexError("این اشتراک متوقف است. اول آن را فعال کن.");
    }

    const window = sub.cycle === "weekly" ? 3 : 10;
    if (sub.nextPaymentDate > daysAheadTehran(window)) {
      throw new ConvexError("پرداخت این دوره قبلا ثبت شده؛ هنوز زود است.");
    }

    const payAccountId = accountId ?? sub.accountId;
    if (!payAccountId) throw new ConvexError("حساب پرداخت را انتخاب کن.");

    const account = await ctx.db.get(payAccountId);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }
    if (account.balance < sub.amount) {
      throw new ConvexError("موجودی حساب کافی نیست.");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId,
      type: "outcome",
      amount: sub.amount,
      title: `اشتراک ${sub.name}`,
      categoryId: "subscription",
      accountId: payAccountId,
      paymentMethod: account.type,
      date,
    });

    await applyToBalance(ctx, payAccountId, "outcome", sub.amount);
    await ctx.db.patch(id, {
      nextPaymentDate: advanceDate(
        sub.nextPaymentDate,
        sub.cycle,
        sub.anchorDay,
      ),
    });

    return transactionId;
  },
});

export const remove = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    await getOwned(ctx, userId, id);
    await ctx.db.delete(id);
  },
});

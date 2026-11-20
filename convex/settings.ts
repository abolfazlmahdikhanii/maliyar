import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { daysAgoTehran, daysAheadTehran } from "./lib/date";
import { jalaliDay } from "./lib/subscriptionSchedule";
import { settingsFields } from "./schema";

const DEFAULTS = {
  notifyChecks: true,
  notifySubscriptions: true,
  notifyInstallments: false,
  notifyBudget: true,
};

const getRow = (ctx: QueryCtx | MutationCtx, userId: Id<"users">) =>
  ctx.db
    .query("settings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

export async function loadSettings(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const row = await getRow(ctx, userId);
  const account = row?.defaultAccountId
    ? await ctx.db.get(row.defaultAccountId)
    : null;

  return {
    notifyChecks: row?.notifyChecks ?? DEFAULTS.notifyChecks,
    notifySubscriptions:
      row?.notifySubscriptions ?? DEFAULTS.notifySubscriptions,
    notifyInstallments: row?.notifyInstallments ?? DEFAULTS.notifyInstallments,
    notifyBudget: row?.notifyBudget ?? DEFAULTS.notifyBudget,
    defaultAccountId: account && account.userId === userId ? account._id : null,
  };
}

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return loadSettings(ctx, userId);
  },
});

export const update = mutation({
  args: settingsFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.defaultAccountId) {
      const account = await ctx.db.get(args.defaultAccountId);
      if (!account || account.userId !== userId) {
        throw new ConvexError("حساب پیدا نشد.");
      }
    }

    const row = await getRow(ctx, userId);
    if (row) await ctx.db.replace(row._id, { ...args, userId });
    else await ctx.db.insert("settings", { ...args, userId });
  },
});

export const exportTransactions = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const bankById = new Map(accounts.map((a) => [a._id, a.bank]));

    return transactions.map((t) => ({
      date: t.date,
      time: t.time ?? "",
      type: t.type,
      amount: t.amount,
      title: t.title ?? "",
      categoryId: t.categoryId,
      bank: bankById.get(t.accountId) ?? "",
      note: t.note ?? "",
    }));
  },
});

async function deleteFinanceData(ctx: MutationCtx, userId: Id<"users">) {
  const loans = await ctx.db
    .query("loans")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const loan of loans) {
    const payments = await ctx.db
      .query("loanPayments")
      .withIndex("by_loan", (q) => q.eq("loanId", loan._id))
      .collect();
    await Promise.all(payments.map((p) => ctx.db.delete(p._id)));
    await ctx.db.delete(loan._id);
  }

  const transactions = await ctx.db
    .query("transactions")
    .withIndex("by_user_date", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(transactions.map((d) => ctx.db.delete(d._id)));

  const checks = await ctx.db
    .query("checks")
    .withIndex("by_user_due", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(checks.map((d) => ctx.db.delete(d._id)));

  const budgets = await ctx.db
    .query("budgets")
    .withIndex("by_user_category", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(budgets.map((d) => ctx.db.delete(d._id)));

  const dues = await ctx.db
    .query("dues")
    .withIndex("by_user_status_due", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(dues.map((d) => ctx.db.delete(d._id)));

  const goals = await ctx.db
    .query("goals")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(goals.map((d) => ctx.db.delete(d._id)));

  const subscriptions = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(subscriptions.map((d) => ctx.db.delete(d._id)));

  const accounts = await ctx.db
    .query("accounts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  await Promise.all(accounts.map((d) => ctx.db.delete(d._id)));
}

export const clearData = mutation({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await deleteFinanceData(ctx, userId);
  },
});

export const deleteAccount = mutation({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await deleteFinanceData(ctx, userId);

    const row = await getRow(ctx, userId);
    if (row) await ctx.db.delete(row._id);

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    for (const session of sessions) {
      const tokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      await Promise.all(tokens.map((t) => ctx.db.delete(t._id)));
      await ctx.db.delete(session._id);
    }

    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    for (const authAccount of authAccounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", authAccount._id))
        .collect();
      await Promise.all(codes.map((c) => ctx.db.delete(c._id)));
      await ctx.db.delete(authAccount._id);
    }

    await ctx.db.delete(userId);
  },
});

export const loadSampleData = mutation({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      throw new ConvexError(
        "برای بارگذاری داده‌ی نمونه، اول داده‌های فعلی رو پاک کن.",
      );
    }

    const accountDefs = [
      {
        type: "card",
        bank: "mellat",
        cardNumber: "6104337811112222",
        initialBalance: 20_000_000,
      },
      {
        type: "card",
        bank: "saman",
        cardNumber: "6219861033334444",
        initialBalance: 8_000_000,
      },
      { type: "wallet", bank: "cash", initialBalance: 1_500_000 },
    ] as const;

    const ids: Id<"accounts">[] = [];
    for (const def of accountDefs) {
      ids.push(
        await ctx.db.insert("accounts", {
          ...def,
          userId,
          balance: def.initialBalance,
        }),
      );
    }
    const [mellat, saman] = ids;

    const delta = new Map<Id<"accounts">, number>();
    let count = 0;
    const addTx = async (
      daysAgo: number,
      type: "income" | "outcome",
      categoryId: string,
      amount: number,
      accountId: Id<"accounts">,
      title?: string,
    ) => {
      await ctx.db.insert("transactions", {
        userId,
        type,
        amount,
        categoryId,
        accountId,
        paymentMethod: accountDefs[ids.indexOf(accountId)].type,
        date: daysAgoTehran(daysAgo),
        time: "12:30",
        ...(title ? { title } : {}),
      });
      delta.set(
        accountId,
        (delta.get(accountId) ?? 0) + (type === "income" ? amount : -amount),
      );
      count++;
    };

    const jitter = (n: number, m: number) =>
      Math.round((n * (1 + (((m * 3) % 5) - 2) * 0.07)) / 10_000) * 10_000;

    for (let m = 0; m < 6; m++) {
      const b = m * 30;
      await addTx(b + 3, "income", "pay", 25_000_000, mellat, "حقوق");
      if (m < 5) {
        await addTx(
          b + 12,
          "income",
          "freelancer",
          jitter(8_000_000, m),
          saman,
          "پروژه‌ی فریلنس",
        );
      }
      await addTx(b + 5, "outcome", "food", jitter(3_200_000, m), mellat);
      await addTx(b + 9, "outcome", "daily-buy", jitter(2_400_000, m), mellat);
      await addTx(b + 14, "outcome", "transport", jitter(900_000, m), mellat);
      await addTx(b + 18, "outcome", "charge", jitter(1_500_000, m), mellat);
      await addTx(
        b + 22,
        "outcome",
        "entertainment",
        jitter(1_100_000, m),
        saman,
      );
      if (m % 2 === 0)
        await addTx(b + 26, "outcome", "health", 2_000_000, mellat);
    }

    for (const [accountId, d] of delta) {
      const account = await ctx.db.get(accountId);
      if (account)
        await ctx.db.patch(accountId, { balance: account.balance + d });
    }

    await ctx.db.insert("checks", {
      userId,
      direction: "received",
      amount: 12_000_000,
      serial: "284591",
      bank: "saman",
      party: "شرکت نگین شرق",
      issueDate: daysAgoTehran(20),
      dueDate: daysAheadTehran(12),
      status: "pending",
    });
    await ctx.db.insert("checks", {
      userId,
      direction: "issued",
      amount: 8_000_000,
      serial: "512034",
      bank: "mellat",
      party: "مالک خانه",
      issueDate: daysAgoTehran(10),
      dueDate: daysAheadTehran(5),
      status: "pending",
    });
    await ctx.db.insert("checks", {
      userId,
      direction: "received",
      amount: 3_000_000,
      serial: "284592",
      bank: "saman",
      party: "آقای رضایی",
      issueDate: daysAgoTehran(40),
      dueDate: daysAgoTehran(10),
      status: "bounced",
    });

    await ctx.db.insert("goals", {
      userId,
      title: "سفر به ترکیه",
      categoryId: "travel",
      targetAmount: 60_000_000,
      savedAmount: 24_000_000,
      deadline: daysAheadTehran(240),
      accountId: saman,
    });
    await ctx.db.insert("goals", {
      userId,
      title: "لپ‌تاپ جدید",
      categoryId: "gadget",
      targetAmount: 40_000_000,
      savedAmount: 40_000_000,
    });
    await ctx.db.insert("goals", {
      userId,
      title: "صندوق اضطراری",
      categoryId: "emergency",
      targetAmount: 100_000_000,
      savedAmount: 15_000_000,
    });

    for (const [categoryId, limit] of [
      ["food", 6_000_000],
      ["transport", 2_000_000],
      ["entertainment", 3_000_000],
    ] as const) {
      await ctx.db.insert("budgets", { userId, categoryId, limit });
    }

    await ctx.db.insert("dues", {
      userId,
      type: "debt",
      amount: 5_000_000,
      party: "برادر",
      dueDate: daysAheadTehran(7),
      reason: "قرض ماه قبل",
      status: "open",
    });
    await ctx.db.insert("dues", {
      userId,
      type: "claim",
      amount: 3_000_000,
      party: "دوست",
      dueDate: daysAgoTehran(3),
      status: "open",
    });

    const loanId = await ctx.db.insert("loans", {
      userId,
      title: "وام خودرو",
      interestRate: 18,
      receivedDate: daysAgoTehran(120),
      firstDueDate: daysAgoTehran(75),
      installmentAmount: 4_500_000,
      installmentCount: 24,
      paidCount: 3,
    });
    for (let i = 0; i < 3; i++) {
      await ctx.db.insert("loanPayments", {
        userId,
        loanId,
        installmentNumber: i + 1,
        amount: 4_500_000,
        paidAt: daysAgoTehran(75 - i * 30),
      });
    }

    for (const s of [
      {
        name: "اسپاتیفای",
        categoryId: "music",
        amount: 250_000,
        cycle: "monthly",
        next: 6,
      },
      {
        name: "نتفلیکس",
        categoryId: "video",
        amount: 400_000,
        cycle: "monthly",
        next: 12,
      },
      {
        name: "فضای ابری",
        categoryId: "cloud",
        amount: 1_200_000,
        cycle: "yearly",
        next: 90,
      },
    ] as const) {
      const nextPaymentDate = daysAheadTehran(s.next);
      await ctx.db.insert("subscriptions", {
        userId,
        name: s.name,
        categoryId: s.categoryId,
        amount: s.amount,
        cycle: s.cycle,
        nextPaymentDate,
        anchorDay: jalaliDay(nextPaymentDate),
        status: "active",
        accountId: mellat,
      });
    }

    return { transactions: count };
  },
});

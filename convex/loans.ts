import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { applyToBalance } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { isValidDate, todayTehran } from "./lib/date";
import { installmentDueDate } from "./lib/loanSchedule";
import { loanFields } from "./schema";

const loanObject = v.object(loanFields);
type LoanInput = Infer<typeof loanObject>;

const normalize = (input: LoanInput): LoanInput => {
  const title = input.title.trim();
  if (!title) throw new ConvexError("عنوان وام را وارد کن.");
  if (title.length > 100) {
    throw new ConvexError("عنوان وام نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  }
  if (
    !Number.isFinite(input.interestRate) ||
    input.interestRate < 0 ||
    input.interestRate > 100
  ) {
    throw new ConvexError("نرخ بهره باید بین ۰ تا ۱۰۰ باشد.");
  }
  if (
    !Number.isInteger(input.installmentAmount) ||
    input.installmentAmount <= 0
  ) {
    throw new ConvexError("قسط ماهانه باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (
    !Number.isInteger(input.installmentCount) ||
    input.installmentCount < 1 ||
    input.installmentCount > 360
  ) {
    throw new ConvexError("مدت وام باید بین ۱ تا ۳۶۰ ماه باشد.");
  }
  if (!isValidDate(input.receivedDate)) {
    throw new ConvexError("تاریخ دریافت وام معتبر نیست.");
  }
  if (!isValidDate(input.firstDueDate)) {
    throw new ConvexError("سررسید اولین قسط معتبر نیست.");
  }
  if (input.firstDueDate < input.receivedDate) {
    throw new ConvexError(
      "سررسید اولین قسط نمی‌تواند قبل از تاریخ دریافت وام باشد.",
    );
  }
  return { ...input, title };
};

function summarize(loan: Doc<"loans">, payments: Doc<"loanPayments">[]) {
  const remainingCount = loan.installmentCount - loan.paidCount;
  return {
    totalAmount: loan.installmentCount * loan.installmentAmount,
    remainingCount,
    remainingDebt: remainingCount * loan.installmentAmount,
    paidAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    nextDueDate:
      remainingCount > 0
        ? installmentDueDate(loan.firstDueDate, loan.paidCount + 1)
        : null,
  };
}

async function getOwnedLoan(
  ctx: MutationCtx,
  userId: Id<"users">,
  id: Id<"loans">,
) {
  const loan = await ctx.db.get(id);
  if (!loan || loan.userId !== userId) throw new ConvexError("وام پیدا نشد.");
  return loan;
}

async function reversePayment(ctx: MutationCtx, payment: Doc<"loanPayments">) {
  if (payment.transactionId) {
    const transaction = await ctx.db.get(payment.transactionId);
    if (transaction) {
      await applyToBalance(
        ctx,
        transaction.accountId,
        transaction.type,
        transaction.amount,
        true,
      );
      await ctx.db.delete(transaction._id);
    }
  }
  await ctx.db.delete(payment._id);
}

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      loans.map(async (loan) => {
        const payments = await ctx.db
          .query("loanPayments")
          .withIndex("by_loan", (q) => q.eq("loanId", loan._id))
          .collect();
        return { ...loan, ...summarize(loan, payments) };
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("loans") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const loan = await ctx.db.get(id);
    if (!loan || loan.userId !== userId) return null;

    const payments = await ctx.db
      .query("loanPayments")
      .withIndex("by_loan", (q) => q.eq("loanId", id))
      .collect();
    const paidByNumber = new Map(payments.map((p) => [p.installmentNumber, p]));

    const installments = Array.from(
      { length: loan.installmentCount },
      (_, i) => {
        const number = i + 1;
        const payment = paidByNumber.get(number);
        return {
          number,
          dueDate: installmentDueDate(loan.firstDueDate, number),
          amount: payment?.amount ?? loan.installmentAmount,
          status: payment ? ("paid" as const) : ("unpaid" as const),
          paidAt: payment?.paidAt ?? null,
          paidFromAccount: payment?.transactionId !== undefined,
        };
      },
    );

    const accountIds = [
      ...new Set(
        payments
          .map((p) => p.accountId)
          .filter((a): a is Id<"accounts"> => a !== undefined),
      ),
    ];
    const accounts = await Promise.all(accountIds.map((aid) => ctx.db.get(aid)));
    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

    const paidInstallments = [...payments]
      .sort((a, b) => b.installmentNumber - a.installmentNumber)
      .map((p) => ({
        number: p.installmentNumber,
        dueDate: installmentDueDate(loan.firstDueDate, p.installmentNumber),
        amount: p.amount,
        paidAt: p.paidAt,
        bank: p.accountId ? (bankById.get(p.accountId) ?? "unknown") : null,
      }));

    return {
      ...loan,
      ...summarize(loan, payments),
      installments,
      paidInstallments,
    };
  },
});

export const add = mutation({
  args: loanFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return ctx.db.insert("loans", {
      ...normalize(args),
      userId,
      paidCount: 0,
    });
  },
});

export const update = mutation({
  args: { id: v.id("loans"), ...loanFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const loan = await getOwnedLoan(ctx, userId, id);

    const data = normalize(fields);
    if (data.installmentCount < loan.paidCount) {
      throw new ConvexError(
        "مدت وام نمی‌تواند کمتر از تعداد اقساط پرداخت‌شده باشد.",
      );
    }

    await ctx.db.patch(id, data);
  },
});

export const payInstallment = mutation({
  args: {
    id: v.id("loans"),
    accountId: v.optional(v.id("accounts")),
    date: v.string(),
  },
  handler: async (ctx, { id, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");
    if (date > todayTehran()) {
      throw new ConvexError("تاریخ پرداخت نمی‌تواند در آینده باشد.");
    }

    const loan = await getOwnedLoan(ctx, userId, id);
    if (date < loan.receivedDate) {
      throw new ConvexError("تاریخ پرداخت نمی‌تواند قبل از دریافت وام باشد.");
    }
    if (loan.paidCount >= loan.installmentCount) {
      throw new ConvexError("همه‌ی اقساط این وام پرداخت شده است.");
    }

    const number = loan.paidCount + 1;
    let transactionId: Id<"transactions"> | undefined;

    if (accountId) {
      const account = await ctx.db.get(accountId);
      if (!account || account.userId !== userId) {
        throw new ConvexError("حساب پیدا نشد.");
      }
      if (account.balance < loan.installmentAmount) {
        throw new ConvexError("موجودی حساب کافی نیست.");
      }

      transactionId = await ctx.db.insert("transactions", {
        userId,
        type: "outcome",
        amount: loan.installmentAmount,
        title: `قسط ${number} ${loan.title}`,
        categoryId: "loan",
        accountId,
        paymentMethod: account.type,
        date,
        source: "loan",
      });

      await applyToBalance(ctx, accountId, "outcome", loan.installmentAmount);
    }

    await ctx.db.insert("loanPayments", {
      userId,
      loanId: id,
      installmentNumber: number,
      amount: loan.installmentAmount,
      paidAt: date,
      ...(accountId && transactionId ? { accountId, transactionId } : {}),
    });

    await ctx.db.patch(id, { paidCount: number });
    return transactionId ?? null;
  },
});

export const undoLastPayment = mutation({
  args: { id: v.id("loans") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const loan = await getOwnedLoan(ctx, userId, id);
    if (loan.paidCount === 0) {
      throw new ConvexError("قسط پرداخت‌شده‌ای وجود ندارد.");
    }

    const payment = await ctx.db
      .query("loanPayments")
      .withIndex("by_loan", (q) =>
        q.eq("loanId", id).eq("installmentNumber", loan.paidCount),
      )
      .unique();
    if (!payment) throw new ConvexError("پرداخت پیدا نشد.");

    await reversePayment(ctx, payment);
    await ctx.db.patch(id, { paidCount: loan.paidCount - 1 });
  },
});

export const remove = mutation({
  args: { id: v.id("loans") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    await getOwnedLoan(ctx, userId, id);

    const payments = await ctx.db
      .query("loanPayments")
      .withIndex("by_loan", (q) => q.eq("loanId", id))
      .collect();
    for (const payment of payments) await reversePayment(ctx, payment);

    await ctx.db.delete(id);
  },
});
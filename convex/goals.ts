import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { applyToBalance } from "./lib/accounts";
import { requireUserId } from "./lib/auth";
import { isValidDate, todayTehran } from "./lib/date";
import { goalFields } from "./schema";

const goalObject = v.object(goalFields);
type GoalInput = Infer<typeof goalObject>;

const MAX_AMOUNT = 1_000_000_000_000;

// اعتبارسنجی سمت سرور + چک مالکیت حساب متصل.
// prevDeadline: در ویرایش، مهلتِ گذشته‌ی بدون تغییر خطا نمی‌دهد (هدف عقب‌افتاده را می‌شود ویرایش کرد)
async function normalize(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: GoalInput,
  prevDeadline?: string,
): Promise<GoalInput> {
  const title = input.title.trim();
  if (!title) throw new ConvexError("نام هدف را وارد کن.");
  if (title.length > 100) {
    throw new ConvexError("نام هدف نباید بیشتر از ۱۰۰ کاراکتر باشد.");
  }
  if (!input.categoryId.trim()) throw new ConvexError("دسته را انتخاب کن.");

  if (
    !Number.isSafeInteger(input.targetAmount) ||
    input.targetAmount <= 0 ||
    input.targetAmount > MAX_AMOUNT
  ) {
    throw new ConvexError("مبلغ هدف باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  if (!Number.isSafeInteger(input.savedAmount) || input.savedAmount < 0) {
    throw new ConvexError("پس‌انداز فعلی باید عدد صحیح و غیرمنفی باشد.");
  }
  if (input.savedAmount > input.targetAmount) {
    throw new ConvexError("پس‌انداز فعلی نمی‌تواند بیشتر از مبلغ هدف باشد.");
  }

  if (input.deadline) {
    if (!isValidDate(input.deadline)) {
      throw new ConvexError("مهلت هدف معتبر نیست.");
    }
    if (input.deadline !== prevDeadline && input.deadline < todayTehran()) {
      throw new ConvexError("مهلت هدف نمی‌تواند در گذشته باشد.");
    }
  }

  if (input.accountId) {
    const account = await ctx.db.get(input.accountId);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }
  }

  return { ...input, title };
}

async function getOwnedGoal(
  ctx: MutationCtx,
  userId: Id<"users">,
  id: Id<"goals">,
) {
  const goal = await ctx.db.get(id);
  if (!goal || goal.userId !== userId) throw new ConvexError("هدف پیدا نشد.");
  return goal;
}

// فهرست اهداف: نیمه‌کاره‌ها اول (نزدیک‌ترین مهلت، بدون مهلت‌ها آخر)، تکمیل‌شده‌ها آخر.
// percent: ۰ تا ۱۰۰ (گرد به پایین، تا ۹۹.۹ «۱۰۰» نشان داده نشود).
// bank: کلید بانک حساب متصل؛ اگر حسابی متصل نیست null.
// «روز مانده» را کلاینت از deadline حساب می‌کند، چون query با گذر زمان دوباره اجرا نمی‌شود.
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // هر حساب فقط یک بار خوانده می‌شود
    const accountIds = [
      ...new Set(
        goals
          .map((g) => g.accountId)
          .filter((id): id is Id<"accounts"> => id !== undefined),
      ),
    ];
    const accounts = await Promise.all(accountIds.map((id) => ctx.db.get(id)));
    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

    return goals
      .map((g) => ({
        ...g,
        bank: g.accountId ? (bankById.get(g.accountId) ?? null) : null,
        percent: Math.min(
          100,
          Math.floor((g.savedAmount / g.targetAmount) * 100),
        ),
        remainingAmount: g.targetAmount - g.savedAmount,
        completed: g.savedAmount >= g.targetAmount,
      }))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.deadline ?? "9999-99-99").localeCompare(
          b.deadline ?? "9999-99-99",
        );
      });
  },
});

export const add = mutation({
  args: goalFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = await normalize(ctx, userId, args);
    return ctx.db.insert("goals", { ...data, userId });
  },
});

export const update = mutation({
  args: { id: v.id("goals"), ...goalFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const goal = await getOwnedGoal(ctx, userId, id);
    const data = await normalize(ctx, userId, fields, goal.deadline);

    // patch: deadline و accountId برابر undefined یعنی فیلد از دیتابیس حذف شود
    await ctx.db.patch(id, {
      ...data,
      deadline: data.deadline,
      accountId: data.accountId,
    });
  },
});

// افزودن پس‌انداز:
// ۱. با حساب (آرگومان یا حساب متصل به هدف): تراکنش هزینه ساخته و موجودی حساب کم می‌شود.
// ۲. بدون حساب: فقط مبلغ پس‌انداز بالا می‌رود (مثلا پول نقد کنار گذاشته‌شده).
// accountId: undefined یعنی حساب متصل به هدف، null یعنی بدون کسر از هیچ حسابی.
// تراکنش مستقل است و قفل نمی‌شود (مثل اشتراک)؛ حذف هدف آن را حذف نمی‌کند.
export const addSavings = mutation({
  args: {
    id: v.id("goals"),
    amount: v.number(),
    accountId: v.optional(v.union(v.id("accounts"), v.null())),
    date: v.string(), // تاریخ پس‌انداز، میلادی YYYY-MM-DD
  },
  handler: async (ctx, { id, amount, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new ConvexError("مبلغ باید عدد صحیح و بزرگ‌تر از صفر باشد.");
    }
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");
    if (date > todayTehran()) {
      throw new ConvexError("تاریخ پس‌انداز نمی‌تواند در آینده باشد.");
    }

    const goal = await getOwnedGoal(ctx, userId, id);
    const remaining = goal.targetAmount - goal.savedAmount;
    if (remaining <= 0) throw new ConvexError("این هدف قبلا تکمیل شده است.");
    if (amount > remaining) {
      throw new ConvexError(
        `فقط ${remaining.toLocaleString("en-US")} تومان تا تکمیل هدف مانده است.`,
      );
    }

    const payAccountId =
      accountId === undefined ? goal.accountId : (accountId ?? undefined);

    let transactionId: Id<"transactions"> | undefined;
    if (payAccountId) {
      const account = await ctx.db.get(payAccountId);
      if (!account || account.userId !== userId) {
        throw new ConvexError("حساب پیدا نشد.");
      }
      if (account.balance < amount) {
        throw new ConvexError("موجودی حساب کافی نیست.");
      }

      transactionId = await ctx.db.insert("transactions", {
        userId,
        type: "outcome",
        amount,
        title: `پس‌انداز ${goal.title}`,
        categoryId: "goal",
        accountId: payAccountId,
        paymentMethod: account.type,
        date,
      });
      await applyToBalance(ctx, payAccountId, "outcome", amount);
    }

    const savedAmount = goal.savedAmount + amount;
    await ctx.db.patch(id, { savedAmount });

    return {
      transactionId: transactionId ?? null,
      completed: savedAmount >= goal.targetAmount,
    };
  },
});

// حذف هدف. تراکنش‌های پس‌انداز قبلی سر جایشان می‌مانند، چون پول واقعا از حساب رفته
export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    await getOwnedGoal(ctx, userId, id);
    await ctx.db.delete(id);
  },
});
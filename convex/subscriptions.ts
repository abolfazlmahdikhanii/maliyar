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

// اعتبارسنجی سمت سرور + چک مالکیت حساب متصل
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
  // categoryId اینجا «دسته‌ی اشتراک» است (موسیقی، فیلم، ...)، نه دسته‌ی تراکنش
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

// فهرست اشتراک‌ها: فعال‌ها اول، به ترتیب نزدیک‌ترین پرداخت.
// bank: کلید بانک حساب متصل؛ اگر حسابی متصل نیست null.
// previousPaymentDate: شروع دوره‌ی فعلی (میلادی)، برای نوار پیشرفت.
// «روز مانده» و درصد پیشرفت را کلاینت از nextPaymentDate و previousPaymentDate حساب
// می‌کند، چون query با گذشت زمان دوباره اجرا نمی‌شود و مقدار سمت سرور کهنه می‌ماند.
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // هر حساب فقط یک بار خوانده می‌شود
    const accountIds = [
      ...new Set(
        subs
          .map((s) => s.accountId)
          .filter((id): id is Id<"accounts"> => id !== undefined),
      ),
    ];
    const accounts = await Promise.all(accountIds.map((id) => ctx.db.get(id)));
    const bankById = new Map<string, string>();
    for (const account of accounts) {
      if (account) bankById.set(account._id, account.bank);
    }

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
    const sub = await getOwned(ctx, userId, id);
    const data = await normalize(ctx, userId, fields);

    // patch: accountId: undefined یعنی اتصال به حساب حذف شود.
    // anchorDay فقط وقتی تاریخ عوض شده از نو ساخته می‌شود؛ وگرنه ویرایش اسم،
    // روز اصلی (مثلا ۳۱) را به روز کوتاه‌شده‌ی ماه فعلی (۳۰) تبدیل می‌کرد
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

// توقف و ازسرگیری (آیتم «توقف» در منو)
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

// ثبت پرداخت این دوره: تراکنش هزینه ساخته می‌شود، موجودی حساب کم می‌شود و تاریخ
// پرداخت بعدی یک دوره جلو می‌رود. همه در یک mutation اتمی.
// حساب: accountId آرگومان، وگرنه حساب متصل به اشتراک؛ اگر هیچ‌کدام نبود خطا.
export const markPaid = mutation({
  args: {
    id: v.id("subscriptions"),
    accountId: v.optional(v.id("accounts")),
    date: v.string(), // تاریخ پرداخت، میلادی YYYY-MM-DD
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

    // جلوگیری از پرداخت پشت‌سرهم که تاریخ را چند دوره جلو می‌برد
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

    // تراکنش مستقل است و قفل نمی‌شود: وضعیت «پرداخت‌شده» جدا نگه داشته نمی‌شود،
    // فقط تاریخ بعدی جلو می‌رود. همه‌ی پرداخت‌ها با دسته‌ی ثابت "subscription" ثبت می‌شوند
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

// تراکنش‌های پرداخت‌شده‌ی قبلی سر جایشان می‌مانند، چون پول واقعا جابه‌جا شده
export const remove = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    await getOwned(ctx, userId, id);
    await ctx.db.delete(id);
  },
});

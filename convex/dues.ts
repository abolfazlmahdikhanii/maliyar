import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { duesFields } from "./schema";

const duesObject = v.object(duesFields);
type DuesInput = Infer<typeof duesObject>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = (s: string) =>
  DATE_RE.test(s) && !Number.isNaN(Date.parse(s));

// اعتبارسنجی سمت سرور + حذف فیلد خالی
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

// همه‌ی موارد کاربر. ایندکس بر اساس (وضعیت، سررسید) مرتب است:
// اول بازها به ترتیب نزدیک‌ترین سررسید، بعد تسویه‌شده‌ها.
// وضعیت نمایشی (نزدیک به سررسید، گذشته) را کلاینت از روی dueDate حساب می‌کند.
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("dues")
      .withIndex("by_user_status_due", (q) => q.eq("userId", userId))
      .collect();
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
    const due = await ctx.db.get(id);
    if (!due || due.userId !== userId) {
      throw new ConvexError("مورد پیدا نشد.");
    }
    if (due.status === "paid") {
      throw new ConvexError("مورد تسویه‌شده قابل ویرایش نیست.");
    }

    const data = normalize(fields);
    // reason: undefined یعنی فیلد از دیتابیس حذف شود
    await ctx.db.patch(id, { ...data, reason: data.reason });
  },
});

// ثبت پرداخت: حساب را همین‌جا می‌گیریم، نه موقع ثبت بدهی یا طلب، چون تا پول جابه‌جا
// نشود معلوم نیست از کدام حساب رفته یا به کدام آمده.
// مورد تسویه می‌شود، تراکنش معادلش ساخته می‌شود و موجودی حساب عوض می‌شود.
// همه در یک mutation اتمی، پس یا همه انجام می‌شود یا هیچ‌کدام.
export const markPaid = mutation({
  args: {
    id: v.id("dues"),
    accountId: v.id("accounts"),
    date: v.string(), // تاریخ پرداخت (میلادی، YYYY-MM-DD) از کلاینت
  },
  handler: async (ctx, { id, accountId, date }) => {
    const userId = await requireUserId(ctx);
    if (!isValidDate(date)) throw new ConvexError("تاریخ معتبر نیست.");

    const due = await ctx.db.get(id);
    if (!due || due.userId !== userId) {
      throw new ConvexError("مورد پیدا نشد.");
    }
    if (due.status === "paid") {
      throw new ConvexError("این مورد قبلا تسویه شده است.");
    }

    const account = await ctx.db.get(accountId);
    if (!account || account.userId !== userId) {
      throw new ConvexError("حساب پیدا نشد.");
    }

    // بدهی من = پول از من خارج می‌شود (هزینه). طلب من = پول وارد می‌شود (درآمد)
    const isDebt = due.type === "debt";

    const transactionId = await ctx.db.insert("transactions", {
      userId,
      type: isDebt ? "outcome" : "income",
      amount: due.amount,
      title: `${isDebt ? "پرداخت بدهی به" : "دریافت طلب از"} ${due.party}`,
      categoryId: isDebt ? "debt" : "claim",
      accountId,
      paymentMethod: account.type,
      date,
      ...(due.reason ? { note: due.reason } : {}),
    });

    await ctx.db.patch(accountId, {
      balance: account.balance + (isDebt ? -due.amount : due.amount),
    });

    await ctx.db.patch(id, {
      status: "paid",
      paidAt: date,
      accountId,
      paymentTransactionId: transactionId,
    });

    return transactionId;
  },
});

// حذف مورد. اگر تسویه شده بود، تراکنش پرداختش هم حذف می‌شود و اثرش روی موجودی
// حساب برمی‌گردد. همه در یک mutation اتمی.
export const remove = mutation({
  args: { id: v.id("dues") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const due = await ctx.db.get(id);
    if (!due || due.userId !== userId) {
      throw new ConvexError("مورد پیدا نشد.");
    }

    if (due.paymentTransactionId) {
      const transaction = await ctx.db.get(due.paymentTransactionId);

      // اگر کاربر تراکنش را قبلا دستی حذف کرده باشد، چیزی برای برگرداندن نیست
      if (transaction && transaction.userId === userId) {
        const account = await ctx.db.get(transaction.accountId);
        if (account) {
          // درآمد موجودی را زیاد کرده بود، پس کم می‌شود؛ هزینه برعکس
          const undo =
            transaction.type === "income" ? -transaction.amount : transaction.amount;
          await ctx.db.patch(account._id, { balance: account.balance + undo });
        }
        await ctx.db.delete(transaction._id);
      }
    }

    await ctx.db.delete(id);
  },
});
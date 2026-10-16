import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { accountFields } from "./schema";

const accountObject = v.object(accountFields);
type AccountInput = Infer<typeof accountObject>;

// پنجره‌ی آمار درآمد/هزینه (روز)
const STATS_DAYS = 30;

// تاریخ n روز قبل به فرمت YYYY-MM-DD (هماهنگ با فرمت فیلد date)
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const normalize = (input: AccountInput): AccountInput => {
  const { cardNumber, iban, bank, ...rest } = input;

  if (!Number.isInteger(rest.initialBalance) || rest.initialBalance < 0) {
    throw new ConvexError("موجودی اولیه باید عدد صحیح و غیرمنفی باشد.");
  }

  // کیف پول: بدون کارت و شبا، شناسه ثابت
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

// جلوگیری از حساب تکراری:
//  - کیف پول برای هر کاربر فقط یکی
//  - شماره کارت بین حساب‌های کاربر یکتا (خودِ بانک آزاد است، چون فقط کارت چک می‌شود)
// excludeId برای update است تا خودِ حسابِ در حال ویرایش، تکراری حساب نشود
async function assertNoDuplicate(
  ctx: MutationCtx,
  userId: Id<"users">,
  data: AccountInput,
  excludeId?: Id<"accounts">,
) {
  if (data.type === "wallet") {
    const wallet = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "wallet"))
      .first();
    if (wallet && wallet._id !== excludeId) {
      throw new ConvexError("کیف پول قبلاً ساخته شده و فقط یکی مجاز است.");
    }
    return; // کیف پول کارت ندارد
  }

  const { cardNumber, iban } = data;

  if (cardNumber) {
    const dup = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("cardNumber"), cardNumber))
      .first();
    if (dup && dup._id !== excludeId) {
      throw new ConvexError("حسابی با این شماره کارت قبلاً ثبت شده است.");
    }
  }

  // اختیاری: شبای تکراری هم یعنی حساب تکراری؛ اگر لازم نداری این بلاک را حذف کن
  if (iban) {
    const dup = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("iban"), iban))
      .first();
    if (dup && dup._id !== excludeId) {
      throw new ConvexError("حسابی با این شماره شبا قبلاً ثبت شده است.");
    }
  }
}

// مجموع درآمد، هزینه و تعداد تراکنش‌ها؛ اگر days داده شود فقط آن بازه‌ی اخیر
function summarize(transactions: Doc<"transactions">[], days?: number) {
  const cutoff = days === undefined ? null : daysAgo(days);
  let totalIncome = 0;
  let totalOutcome = 0;
  let transactionCount = 0;
  for (const t of transactions) {
    if (cutoff !== null && t.date < cutoff) continue;
    transactionCount++;
    if (t.type === "income") totalIncome += t.amount;
    else totalOutcome += t.amount;
  }
  return { totalIncome, totalOutcome, transactionCount };
}

// فهرست حساب‌ها با آمار ۳۰ روز اخیر هر حساب
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const cutoff = daysAgo(STATS_DAYS);

    // تراکنش‌ها یک بار خوانده می‌شود (جدیدترین اول) و بین حساب‌ها پخش می‌شود
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const byAccount = new Map<string, Doc<"transactions">[]>();
    for (const t of transactions) {
      if (t.date < cutoff) break; // مرتب است؛ به قبل از ۳۰ روز رسیدیم، ادامه لازم نیست
      const list = byAccount.get(t.accountId);
      if (list) list.push(t);
      else byAccount.set(t.accountId, [t]);
    }

    return accounts.map((account) => {
      const own = byAccount.get(account._id) ?? [];
      return {
        ...account,
        ...summarize(own, STATS_DAYS),
      };
    });
  },
});

// یک حساب با آمار ۳۰ روز اخیر و همه‌ی تراکنش‌هایش (برای صفحه‌ی جزئیات)
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

    // ایندکس by_account بر اساس تاریخ مرتب نیست؛ جدیدترین اول
    transactions.sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        (b.time ?? "").localeCompare(a.time ?? ""),
    );

    // آمار فقط ۳۰ روز اخیر؛ اگر جمعِ کل می‌خواهی: summarize(transactions)
    return { ...account, ...summarize(transactions, STATS_DAYS), transactions };
  },
});

export const add = mutation({
  args: accountFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = normalize(args);
    await assertNoDuplicate(ctx, userId, data);

    // موجودی فعلی در شروع برابر موجودی اولیه است
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

    const data = normalize(fields);
    await assertNoDuplicate(ctx, userId, data, id);

    // replace کل سند را عوض می‌کند، پس balance باید دستی نگه داشته شود.
    // اگر موجودی اولیه عوض شد، موجودی فعلی هم به همان اندازه جابه‌جا می‌شود
    const delta = data.initialBalance - account.initialBalance;
    return ctx.db.replace(id, {
      ...data,
      userId,
      balance: account.balance + delta,
    });
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

    // حسابی که تراکنش دارد حذف نشود، وگرنه تراکنش‌ها بی‌صاحب می‌مانند
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
// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// فیلدها جدا export می‌شوند تا در args توابع CRUD دوباره استفاده شوند.

export const accountFields = {
  type: v.union(v.literal("card"), v.literal("wallet")),
  bank: v.string(),
  cardNumber: v.optional(v.string()), // ۱۶ رقم، بدون فاصله
  iban: v.optional(v.string()), // ۲۴ رقم، بدون پیشوند IR
  initialBalance: v.number(), // تومان، عدد صحیح
};

export const transactionFields = {
  type: v.union(v.literal("income"), v.literal("outcome")),
  amount: v.number(), // تومان، عدد صحیح
  title: v.optional(v.string()),
  categoryId: v.string(),
  accountId: v.id("accounts"),
  paymentMethod: v.string(), // نوع پرداخت
  date: v.string(), // میلادی، YYYY-MM-DD
  time: v.optional(v.string()), // HH:mm
  note: v.optional(v.string()),
};
export const budgetFields = {
  categoryId: v.string(),
  limit: v.number(), // سقف ماهانه، تومان، عدد صحیح
};
export const duesFields = {
  type: v.union(v.literal("debt"), v.literal("claim")), // بدهی من | طلب من
  amount: v.number(), // تومان، عدد صحیح
  party: v.string(), // طرف حساب
  dueDate: v.string(), // سررسید، میلادی YYYY-MM-DD
  reason: v.optional(v.string()), // علت یا شرح
};

export const loanFields = {
  title: v.string(),
  interestRate: v.number(), // درصد سالانه، برای نمایش
  receivedDate: v.string(), // تاریخ دریافت وام، میلادی YYYY-MM-DD
  firstDueDate: v.string(), // سررسید اولین قسط (پایه‌ی زمان‌بندی)
  installmentAmount: v.number(), // قسط ماهانه، تومان
  installmentCount: v.number(), // مدت (ماه) = تعداد کل اقساط
};

export const goalFields = {
  title: v.string(),
  targetAmount: v.number(),
  savedAmount: v.number(),
  deadline: v.optional(v.string()), // YYYY-MM-DD
};

export const checkFields = {
  direction: v.union(v.literal("issued"), v.literal("received")), // issued = پرداختی
  amount: v.number(), // تومان، عدد صحیح
  serial: v.string(),
  bank: v.string(), // key بانک
  party: v.string(), // صادرکننده (دریافتی) / در وجه (پرداختی)
  issueDate: v.string(), // YYYY-MM-DD
  dueDate: v.string(), // YYYY-MM-DD
};

export const subscriptionFields = {
  name: v.string(),
  amount: v.number(),
  period: v.union(v.literal("monthly"), v.literal("yearly")),
  nextBillingDate: v.string(), // YYYY-MM-DD
};

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),
  accounts: defineTable({
    ...accountFields,
    userId: v.id("users"),
    balance: v.number(),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    ...transactionFields,
    userId: v.id("users"),
    source: v.optional(v.union(v.literal("loan"), v.literal("dues"),v.literal("check"))),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_account", ["accountId"]),
  budgets: defineTable({ ...budgetFields, userId: v.id("users") }).index(
    "by_user_category",
    ["userId", "categoryId"],
  ),
  dues: defineTable({
    ...duesFields,
    userId: v.id("users"),
    status: v.union(v.literal("open"), v.literal("paid")),
    paidAt: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")), // حسابی که از آن پرداخت شد
    paymentTransactionId: v.optional(v.id("transactions")),
  }).index("by_user_status_due", ["userId", "status", "dueDate"]),

  goals: defineTable(goalFields),

  checks: defineTable({
  ...checkFields,
  userId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("cleared"),
    v.literal("bounced"),
  ),
  clearedAt: v.optional(v.string()),
  accountId: v.optional(v.id("accounts")),
  paymentTransactionId: v.optional(v.id("transactions")),
})
  .index("by_user_due", ["userId", "dueDate"])
  .index("by_user_bank_serial", ["userId", "bank", "serial"]),

  loans: defineTable({
    ...loanFields,
    userId: v.id("users"),
    paidCount: v.number(), // تعداد اقساط پرداخت‌شده؛ فقط سرور تغییرش می‌دهد
  }).index("by_user", ["userId"]),

  loanPayments: defineTable({
    userId: v.id("users"),
    loanId: v.id("loans"),
    installmentNumber: v.number(),
    amount: v.number(),
    paidAt: v.string(),
    accountId: v.optional(v.id("accounts")), // نبودنش یعنی شخص دیگری ریخته
    transactionId: v.optional(v.id("transactions")),
  }).index("by_loan", ["loanId", "installmentNumber"]),

  subscriptions: defineTable(subscriptionFields).index("by_next_billing", [
    "nextBillingDate",
  ]),
});

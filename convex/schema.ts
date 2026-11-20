// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export const accountFields = {
  type: v.union(v.literal("card"), v.literal("wallet")),
  bank: v.string(),
  cardNumber: v.optional(v.string()), 
  iban: v.optional(v.string()), 
  initialBalance: v.number(),
};

export const transactionFields = {
  type: v.union(v.literal("income"), v.literal("outcome")),
  amount: v.number(), 
  title: v.optional(v.string()),
  categoryId: v.string(),
  accountId: v.id("accounts"),
  paymentMethod: v.string(), 
  date: v.string(), 
  time: v.optional(v.string()), 
  note: v.optional(v.string()),
};
export const budgetFields = {
  categoryId: v.string(),
  limit: v.number(),
};
export const duesFields = {
  type: v.union(v.literal("debt"), v.literal("claim")),
  amount: v.number(), 
  party: v.string(), 
  dueDate: v.string(), 
  reason: v.optional(v.string()), 
};

export const loanFields = {
  title: v.string(),
  interestRate: v.number(), 
  receivedDate: v.string(),
  firstDueDate: v.string(), 
  installmentAmount: v.number(),
  installmentCount: v.number(), 
};

export const goalFields = {
  title: v.string(),
  categoryId: v.string(), 
  targetAmount: v.number(), 
  savedAmount: v.number(), 
  deadline: v.optional(v.string()), 
  accountId: v.optional(v.id("accounts")), 
};

export const checkFields = {
  direction: v.union(v.literal("issued"), v.literal("received")), 
  amount: v.number(),
  serial: v.string(),
  bank: v.string(), 
  party: v.string(), 
  issueDate: v.string(), 
  dueDate: v.string(), 
};

export const settingsFields = {
  notifyChecks: v.boolean(),
  notifySubscriptions: v.boolean(),
  notifyInstallments: v.boolean(),
  notifyBudget: v.boolean(),
  defaultAccountId: v.optional(v.id("accounts")),
};

export const subscriptionFields = {
  name: v.string(),
  categoryId: v.string(), 
  amount: v.number(), 
  cycle: v.union(
    v.literal("weekly"),
    v.literal("monthly"),
    v.literal("three-month"),
    v.literal("yearly"),
  ),
  nextPaymentDate: v.string(),
  accountId: v.optional(v.id("accounts")),
  status: v.union(v.literal("active"), v.literal("inactive")),
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
    source: v.optional(
      v.union(v.literal("loan"), v.literal("dues"), v.literal("check")),
    ),
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
    accountId: v.optional(v.id("accounts")), 
    paymentTransactionId: v.optional(v.id("transactions")),
  }).index("by_user_status_due", ["userId", "status", "dueDate"]),

  goals: defineTable({ ...goalFields, userId: v.id("users") }).index(
    "by_user",
    ["userId"],
  ),

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
    paidCount: v.number(),
  }).index("by_user", ["userId"]),

  loanPayments: defineTable({
    userId: v.id("users"),
    loanId: v.id("loans"),
    installmentNumber: v.number(),
    amount: v.number(),
    paidAt: v.string(),
    accountId: v.optional(v.id("accounts")), 
    transactionId: v.optional(v.id("transactions")),
  }).index("by_loan", ["loanId", "installmentNumber"]),

  subscriptions: defineTable({
    ...subscriptionFields,
    userId: v.id("users"),
    anchorDay: v.number(),
  }).index("by_user", ["userId"]),

  settings: defineTable({ ...settingsFields, userId: v.id("users") }).index(
    "by_user",
    ["userId"],
  ),
  aiRequests: defineTable({
    userId: v.id("users"),
    at: v.number(),
  }).index("by_user_at", ["userId", "at"]),
});

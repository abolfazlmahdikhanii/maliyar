import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { budgetFields } from "./schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validate(input: { categoryId: string; limit: number }) {
  const categoryId = input.categoryId.trim();
  if (!categoryId) throw new ConvexError("دسته‌بندی را انتخاب کن.");
  if (!Number.isInteger(input.limit) || input.limit <= 0) {
    throw new ConvexError("سقف بودجه باید عدد صحیح و بزرگ‌تر از صفر باشد.");
  }
  return { categoryId, limit: input.limit };
}

async function assertCategoryFree(
  ctx: MutationCtx,
  userId: Id<"users">,
  categoryId: string,
  selfId?: Id<"budgets">,
) {
  const existing = await ctx.db
    .query("budgets")
    .withIndex("by_user_category", (q) =>
      q.eq("userId", userId).eq("categoryId", categoryId),
    )
    .first();
  if (existing && existing._id !== selfId) {
    throw new ConvexError("برای این دسته قبلا بودجه ثبت شده است.");
  }
}

export const list = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      throw new ConvexError("بازه‌ی تاریخ معتبر نیست.");
    }

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_category", (q) => q.eq("userId", userId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).gte("date", from).lte("date", to),
      )
      .collect();

    const usedByCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "outcome") continue;
      usedByCategory.set(
        t.categoryId,
        (usedByCategory.get(t.categoryId) ?? 0) + t.amount,
      );
    }

    return budgets
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((b) => ({ ...b, used: usedByCategory.get(b.categoryId) ?? 0 }));
  },
});

export const add = mutation({
  args: budgetFields,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const data = validate(args);
    await assertCategoryFree(ctx, userId, data.categoryId);
    return ctx.db.insert("budgets", { ...data, userId });
  },
});

export const update = mutation({
  args: { id: v.id("budgets"), ...budgetFields },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUserId(ctx);
    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== userId) {
      throw new ConvexError("بودجه پیدا نشد.");
    }

    const data = validate(fields);
    await assertCategoryFree(ctx, userId, data.categoryId, id);
    await ctx.db.replace(id, { ...data, userId });
  },
});

export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== userId) {
      throw new ConvexError("بودجه پیدا نشد.");
    }
    await ctx.db.delete(id);
  },
});
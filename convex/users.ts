import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const isUsernameTaken = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username.toLowerCase()))
      .first();
    return u !== null;
  },
});

export const emailByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username.toLowerCase()))
      .first();
    return u?.email ?? null;
  },
});

export const me = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    
    return {
    //   _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      image: user.image,
    };
  },
});
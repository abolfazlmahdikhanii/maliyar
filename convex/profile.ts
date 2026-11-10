import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./lib/auth";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
    };
  },
});

export const update = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("کاربر پیدا نشد.");

    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    const username = args.username.trim().toLowerCase();
    const email = args.email.trim().toLowerCase();

    if (!firstName || firstName.length > 50) throw new ConvexError("نام معتبر نیست.");
    if (!lastName || lastName.length > 50) throw new ConvexError("نام خانوادگی معتبر نیست.");
    if (!USERNAME_RE.test(username)) {
      throw new ConvexError("نام کاربری باید ۳ تا ۲۰ حرف انگلیسی، عدد یا _ باشد.");
    }
    if (!EMAIL_RE.test(email)) throw new ConvexError("ایمیل معتبر نیست.");

    if (username !== user.username) {
      const taken = await ctx.db
        .query("users")
        .withIndex("username", (q) => q.eq("username", username))
        .first();
      if (taken && taken._id !== userId) {
        throw new ConvexError("این نام کاربری قبلاً گرفته شده.");
      }
    }
    if (email !== user.email) {
      const taken = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first();
      if (taken && taken._id !== userId) {
        throw new ConvexError("این ایمیل قبلاً ثبت شده.");
      }
    }

    // ورود با مقدار ذخیره‌شده توی authAccounts انجام می‌شه (ایمیل یا نام کاربری).
    // اگه همون مقدار قدیمی بود، با مقدار جدید عوض می‌شه تا ورود خراب نشه
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    for (const account of authAccounts) {
      const next =
        account.providerAccountId === user.email
          ? email
          : account.providerAccountId === user.username
            ? username
            : null;
      if (!next || next === account.providerAccountId) continue;

      const clash = await ctx.db
        .query("authAccounts")
        .withIndex("providerAndAccountId", (q) =>
          q.eq("provider", account.provider).eq("providerAccountId", next),
        )
        .first();
      if (clash && clash.userId !== userId) {
        throw new ConvexError("این مقدار قبلاً برای ورود استفاده شده.");
      }
      await ctx.db.patch(account._id, { providerAccountId: next });
    }

    await ctx.db.patch(userId, { firstName, lastName, username, email });
  },
});
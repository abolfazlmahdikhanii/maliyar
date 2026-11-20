import {
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";

export const passwordAccountId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", userId).eq("provider", "password"),
      )
      .first();
    return account?.providerAccountId ?? null;
  },
});

export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, { currentPassword, newPassword }): Promise<void> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("لطفا وارد حساب شو.");

    if (newPassword.length < 8 || newPassword.length > 100) {
      throw new ConvexError("رمز جدید باید بین ۸ تا ۱۰۰ کاراکتر باشد.");
    }
    if (newPassword === currentPassword) {
      throw new ConvexError("رمز جدید باید با رمز فعلی فرق داشته باشد.");
    }

    const accountId = await ctx.runQuery(internal.security.passwordAccountId, {
      userId,
    });
    if (!accountId) throw new ConvexError("حساب ورود پیدا نشد.");

    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: { id: accountId, secret: currentPassword },
      });
    } catch {
      throw new ConvexError("رمز عبور فعلی درست نیست.");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: accountId, secret: newPassword },
    });

    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, {
      userId,
      except: sessionId ? [sessionId] : [],
    });
  },
});
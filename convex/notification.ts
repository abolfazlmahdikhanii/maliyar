import { getAuthUserId } from "@convex-dev/auth/server";
import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";
import { query } from "./_generated/server";
import { daysAheadTehran, todayTehran } from "./lib/date";
import { installmentDueDate } from "./lib/loanSchedule";
import { loadSettings } from "./settings";

// چند روز مانده به سررسید هشدار بدهیم
const SOON_DAYS = 3;

export type Notice =
  | {
      kind: "check";
      id: string;
      direction: "received" | "issued";
      party: string;
      amount: number;
      dueDate: string;
    }
  | {
      kind: "subscription";
      id: string;
      name: string;
      amount: number;
      dueDate: string;
    }
  | { kind: "loan"; id: string; title: string; amount: number; dueDate: string }
  | {
      kind: "due";
      id: string;
      type: "debt" | "claim";
      party: string;
      amount: number;
      dueDate: string;
    }
  | {
      kind: "budget";
      id: string;
      categoryId: string;
      used: number;
      limit: number;
    };

const pad = (n: number) => String(n).padStart(2, "0");

// بازه‌ی میلادی ماه شمسی جاری
function currentMonthRange(today: string) {
  const [gy, gm, gd] = today.split("-").map(Number);
  const { jy, jm } = toJalaali(gy, gm, gd);
  const fmt = (g: { gy: number; gm: number; gd: number }) =>
    `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
  return {
    from: fmt(toGregorian(jy, jm, 1)),
    to: fmt(toGregorian(jy, jm, jalaaliMonthLength(jy, jm))),
  };
}

// سررسید گذشته یا نزدیک، به ترتیب تاریخ؛ بودجه‌های پر آخر.
// نتیجه با تغییر داده یا باز شدن دوباره‌ی برنامه به‌روز می‌شه، نه با گذر خودِ زمان.
export const list = query({
  handler: async (ctx): Promise<Notice[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const settings = await loadSettings(ctx, userId);
    const limit = daysAheadTehran(SOON_DAYS);
    const notices: Notice[] = [];

    if (settings.notifyChecks) {
      const checks = await ctx.db
        .query("checks")
        .withIndex("by_user_due", (q) =>
          q.eq("userId", userId).lte("dueDate", limit),
        )
        .collect();
      for (const c of checks) {
        if (c.status !== "pending") continue;
        notices.push({
          kind: "check",
          id: c._id,
          direction: c.direction,
          party: c.party,
          amount: c.amount,
          dueDate: c.dueDate,
        });
      }
    }

    if (settings.notifySubscriptions) {
      const subs = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const s of subs) {
        if (s.status !== "active" || s.nextPaymentDate > limit) continue;
        notices.push({
          kind: "subscription",
          id: s._id,
          name: s.name,
          amount: s.amount,
          dueDate: s.nextPaymentDate,
        });
      }
    }

    if (settings.notifyInstallments) {
      const loans = await ctx.db
        .query("loans")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const l of loans) {
        if (l.paidCount >= l.installmentCount) continue;
        const dueDate = installmentDueDate(l.firstDueDate, l.paidCount + 1);
        if (dueDate > limit) continue;
        notices.push({
          kind: "loan",
          id: l._id,
          title: l.title,
          amount: l.installmentAmount,
          dueDate,
        });
      }

      const dues = await ctx.db
        .query("dues")
        .withIndex("by_user_status_due", (q) =>
          q.eq("userId", userId).eq("status", "open").lte("dueDate", limit),
        )
        .collect();
      for (const d of dues) {
        notices.push({
          kind: "due",
          id: d._id,
          type: d.type,
          party: d.party,
          amount: d.amount,
          dueDate: d.dueDate,
        });
      }
    }

    notices.sort((a, b) =>
      "dueDate" in a && "dueDate" in b ? a.dueDate.localeCompare(b.dueDate) : 0,
    );

    if (settings.notifyBudget) {
      const range = currentMonthRange(todayTehran());
      const [budgets, transactions] = await Promise.all([
        ctx.db
          .query("budgets")
          .withIndex("by_user_category", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("transactions")
          .withIndex("by_user_date", (q) =>
            q
              .eq("userId", userId)
              .gte("date", range.from)
              .lte("date", range.to),
          )
          .collect(),
      ]);

      const used = new Map<string, number>();
      for (const t of transactions) {
        if (t.type !== "outcome") continue;
        used.set(t.categoryId, (used.get(t.categoryId) ?? 0) + t.amount);
      }
      for (const b of budgets) {
        const spent = used.get(b.categoryId) ?? 0;
        if (spent >= b.limit) {
          notices.push({
            kind: "budget",
            id: b._id,
            categoryId: b.categoryId,
            used: spent,
            limit: b.limit,
          });
        }
      }
    }

    return notices;
  },
});

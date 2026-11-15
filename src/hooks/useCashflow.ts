// hooks/useCashflow.ts
import { useQuery } from "convex/react";
import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";

export type CashflowMode = "weekly" | "monthly" | "yearly";

export type CashflowPoint = {
  label: string;
  income: number;
  outcome: number;
  net: number; 
};

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const weekdayFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "short",
});

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (jy: number, jm: number, jd: number) => {
  const g = toGregorian(jy, jm, jd);
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
};

type Bucket = { key: string; label: string };
type Plan = { from: string; to: string; buckets: Bucket[]; keyOf: (date: string) => string };


function weeklyPlan(): Plan {
  const day = (offset: number) =>
    new Date(Date.now() - offset * 86_400_000).toLocaleDateString("sv-SE");

  const buckets = Array.from({ length: 7 }, (_, i) => {
    const date = day(6 - i);
    return {
      key: date,
      label: weekdayFormat.format(new Date(`${date}T12:00:00`)),
    };
  });
  return {
    from: buckets[0].key,
    to: buckets[buckets.length - 1].key,
    buckets,
    keyOf: (date) => date,
  };
}


function monthsPlan(count: number): Plan {
  const { jy, jm } = toJalaali(new Date());
  const buckets = Array.from({ length: count }, (_, i) => {
    const total = jy * 12 + (jm - 1) - (count - 1 - i);
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    return { key: `${y}-${m}`, label: MONTH_NAMES[m - 1], y, m };
  });
  const first = buckets[0];
  const last = buckets[buckets.length - 1];

  return {
    from: iso(first.y, first.m, 1),
    to: iso(last.y, last.m, jalaaliMonthLength(last.y, last.m)),
    buckets,
    keyOf: (date) => {
      const [gy, gm, gd] = date.split("-").map(Number);
      const j = toJalaali(gy, gm, gd);
      return `${j.jy}-${j.jm}`;
    },
  };
}

export function useCashflow(mode: CashflowMode) {
  const plan = useMemo(
    () =>
      mode === "weekly"
        ? weeklyPlan()
        : monthsPlan(mode === "monthly" ? 6 : 12),
    [mode],
  );

  const transactions = useQuery(api.transactions.list, {
    from: plan.from,
    to: plan.to,
  });

  const points = useMemo<CashflowPoint[]>(() => {
    const sums = new Map<string, { income: number; outcome: number }>();
    for (const t of transactions ?? []) {
      const key = plan.keyOf(t.date);
      const s = sums.get(key) ?? { income: 0, outcome: 0 };
      if (t.type === "income") s.income += t.amount;
      else s.outcome += t.amount;
      sums.set(key, s);
    }

    return plan.buckets.map(({ key, label }) => {
      const { income, outcome } = sums.get(key) ?? { income: 0, outcome: 0 };
      return { label, income, outcome, net: income - outcome };
    });
  }, [transactions, plan]);

  return {
    loading: transactions === undefined,
    points,
    isEmpty: points.every((p) => p.income === 0 && p.outcome === 0),
  };
}
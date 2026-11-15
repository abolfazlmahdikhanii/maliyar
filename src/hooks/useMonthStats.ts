import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { toGregorian, toJalaali } from "jalaali-js";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { getCategory } from "../../data/categories";

type Tx = FunctionReturnType<typeof api.transactions.list>[number];
type Range = { from: string; to: string };
export type StatGroup = { label: string; value: number; color: string };

const OTHER_COLOR = "#94a3b8";
const pad = (n: number) => String(n).padStart(2, "0");


const previousMonthRange = (from: string): Range => {
  const d = new Date(`${from}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1); 
  const to = d.toISOString().slice(0, 10);

  const [gy, gm, gd] = to.split("-").map(Number);
  const { jy, jm } = toJalaali(gy, gm, gd);
  const first = toGregorian(jy, jm, 1);
  return { from: `${first.gy}-${pad(first.gm)}-${pad(first.gd)}`, to };
};

const total = (txs: Tx[], type: Tx["type"]) =>
  txs.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);


const topGroups = (txs: Tx[], type: Tx["type"], max: number): StatGroup[] => {
  const sums = new Map<string, number>();
  for (const t of txs) {
    if (t.type === type) {
      sums.set(t.categoryId, (sums.get(t.categoryId) ?? 0) + t.amount);
    }
  }

  const sorted = [...sums]
    .sort((a, b) => b[1] - a[1])
    .map(([id, value]) => {
      const category = getCategory(id);
      return {
        label: category?.label.trim() ?? id,
        value,
        color: category?.color ?? OTHER_COLOR,
      };
    });

  if (sorted.length <= max) return sorted;
  const rest = sorted.slice(max - 1).reduce((sum, g) => sum + g.value, 0);
  return [
    ...sorted.slice(0, max - 1),
    { label: "سایر", value: rest, color: OTHER_COLOR },
  ];
};

const change = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;


export function useMonthStats(range: Range, current: Tx[] | undefined) {
  const prevRange = useMemo(() => previousMonthRange(range.from), [range.from]);
  const previous = useQuery(api.transactions.list, prevRange);

  const txs = current ?? [];
  const prevTxs = previous ?? [];
  const income = total(txs, "income");
  const outcome = total(txs, "outcome");

  return {
    loading: current === undefined || previous === undefined,
    count: txs.length,
    income,
    outcome,
    incomeGroups: topGroups(txs, "income", 2),
    outcomeGroups: topGroups(txs, "outcome", 3),
    countChange: change(txs.length, prevTxs.length),
    incomeChange: change(income, total(prevTxs, "income")),
    outcomeChange: change(outcome, total(prevTxs, "outcome")),
  };
}
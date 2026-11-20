import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

export type Cycle = "weekly" | "monthly" | "three-month" | "yearly";

const MONTHS: Record<Exclude<Cycle, "weekly">, number> = {
  monthly: 1,
  "three-month": 3,
  yearly: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

export function jalaliDay(iso: string): number {
  const [gy, gm, gd] = iso.split("-").map(Number);
  return toJalaali(gy, gm, gd).jd;
}

function shift(
  iso: string,
  cycle: Cycle,
  anchorDay: number,
  dir: 1 | -1,
): string {
  if (cycle === "weekly") {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 7 * dir);
    return d.toISOString().slice(0, 10);
  }

  const [gy, gm, gd] = iso.split("-").map(Number);
  const { jy, jm } = toJalaali(gy, gm, gd);

  const total = jy * 12 + (jm - 1) + dir * MONTHS[cycle];
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(anchorDay, jalaaliMonthLength(year, month));

  const g = toGregorian(year, month, day);
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

export const advanceDate = (iso: string, cycle: Cycle, anchorDay: number) =>
  shift(iso, cycle, anchorDay, 1);

export const previousDate = (iso: string, cycle: Cycle, anchorDay: number) =>
  shift(iso, cycle, anchorDay, -1);

import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

export type Cycle = "weekly" | "monthly" | "three-month" | "yearly";

const MONTHS: Record<Exclude<Cycle, "weekly">, number> = {
  monthly: 1,
  "three-month": 3,
  yearly: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

// روز ماه شمسی یک تاریخ میلادی (YYYY-MM-DD)
export function jalaliDay(iso: string): number {
  const [gy, gm, gd] = iso.split("-").map(Number);
  return toJalaali(gy, gm, gd).jd;
}

// یک دوره جلو (dir = 1) یا عقب (dir = -1). هفتگی: ۷ روز. بقیه: به ماه شمسی، در همان
// روز ماه (anchorDay). اگر ماه مقصد آن روز را نداشته باشد، آخرین روز ماه گرفته می‌شود،
// ولی چون anchorDay عوض نمی‌شود، ماه بعد دوباره به همان روز اصلی برمی‌گردد
// (روز ۳۱ برای همیشه ۳۰ نمی‌شود).
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

// یک دوره بعد: پرداخت بعدی
export const advanceDate = (iso: string, cycle: Cycle, anchorDay: number) =>
  shift(iso, cycle, anchorDay, 1);

// یک دوره قبل: شروع دوره‌ی فعلی (برای نوار پیشرفت)
export const previousDate = (iso: string, cycle: Cycle, anchorDay: number) =>
  shift(iso, cycle, anchorDay, -1);
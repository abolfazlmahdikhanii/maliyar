import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

const pad = (n: number) => String(n).padStart(2, "0");

export function installmentDueDate(
  firstDueDate: string,
  number: number,
): string {
  const [gy, gm, gd] = firstDueDate.split("-").map(Number);
  const { jy, jm, jd } = toJalaali(gy, gm, gd);

  const total = jy * 12 + (jm - 1) + (number - 1);
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(jd, jalaaliMonthLength(year, month));

  const g = toGregorian(year, month, day);
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

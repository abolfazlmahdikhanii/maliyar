import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;


export const getCurrentMonthRange = () => {
  const now = new Date();
  const { jy, jm } = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const start = toGregorian(jy, jm, 1);
  const end = toGregorian(jy, jm, jalaaliMonthLength(jy, jm));

  return {
    from: iso(start.gy, start.gm, start.gd),
    to: iso(end.gy, end.gm, end.gd),
  };
};
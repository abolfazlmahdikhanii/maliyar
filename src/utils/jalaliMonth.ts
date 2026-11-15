import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

export type YearMonth = { year: number; month: number };

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export const getCurrentYearMonth = (): YearMonth => {
  const now = new Date();
  const { jy, jm } = toJalaali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  return { year: jy, month: jm };
};

export const getMonthRange = ({ year, month }: YearMonth) => {
  const start = toGregorian(year, month, 1);
  const end = toGregorian(year, month, jalaaliMonthLength(year, month));

  return {
    from: iso(start.gy, start.gm, start.gd),
    to: iso(end.gy, end.gm, end.gd),
  };
};

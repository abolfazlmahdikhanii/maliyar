// تاریخ واقعی میلادی؛ ۲۰۲۵-۰۲-۳۱ رد می‌شه
export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

const tehranDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(d);

// امروز به وقت تهران، YYYY-MM-DD
export const todayTehran = () => tehranDate(new Date());

// تاریخ n روز قبل به وقت تهران، YYYY-MM-DD
export const daysAgoTehran = (n: number) =>
  tehranDate(new Date(Date.now() - n * 86_400_000));

// تاریخ n روز بعد به وقت تهران، YYYY-MM-DD
export const daysAheadTehran = (n: number) =>
  tehranDate(new Date(Date.now() + n * 86_400_000));
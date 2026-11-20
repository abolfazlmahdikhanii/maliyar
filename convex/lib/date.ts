const tehranDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tehran",
});

export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

const tehranDate = (d: Date) => tehranDateFormatter.format(d);

export const todayTehran = () => tehranDate(new Date());

export const daysAgoTehran = (n: number) =>
  tehranDate(new Date(Date.now() - n * 86_400_000));

export const daysAheadTehran = (n: number) =>
  tehranDate(new Date(Date.now() + n * 86_400_000));
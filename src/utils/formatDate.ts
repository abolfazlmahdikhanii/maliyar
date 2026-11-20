const dayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthNumberFormatter = new Intl.DateTimeFormat(
  "en-u-ca-persian-nu-latn",
  {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
);

export const formatDay = (iso: string) => {
  if (!iso) return;
  return dayFormatter.format(new Date(`${iso}T00:00:00`));
};

export const formatDate = (iso: string) => {
  if (!iso) return;
  return dateFormatter.format(new Date(`${iso}T00:00:00`));
};

export const formatDueDate = (iso: string) => {
  if (!iso) return;

  const date = dateFormatter.format(new Date(`${iso}T00:00:00`));
  const [day, months, year] = date.split(" ");

  return { day, months, year };
};

export const getMonthNumber = (date: string): number | boolean => {
  if (!date) return false;

  const parts = Object.fromEntries(
    monthNumberFormatter
      .formatToParts(new Date(`${date}T00:00:00`))
      .map((p) => [p.type, p.value]),
  );

  return Number(parts.month);
};
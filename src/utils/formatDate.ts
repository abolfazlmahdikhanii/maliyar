const dayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const formatDay = (iso: string) => {
  if (!iso) return;
  return dayFormatter.format(new Date(`${iso}T00:00:00`));
};
const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
 
  day: "numeric",
  month: "long",
  year:"numeric"
});

export const formatDate = (iso: string) => {
  if (!iso) return;
  return dateFormatter.format(new Date(`${iso}T00:00:00`));
};
export const getMonthNumber = (date: string): number | boolean => {
  if (!date) return false;
  const formatter = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(`${date}T00:00:00`))
      .map((p) => [p.type, p.value]),
  );
  return Number(parts.month);
};

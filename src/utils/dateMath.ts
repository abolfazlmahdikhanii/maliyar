const DAY = 86_400_000;
const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const todayTime = () => toTime(new Date().toLocaleDateString("sv-SE"));


export const daysUntil = (iso: string) =>
  Math.round((toTime(iso) - todayTime()) / DAY);


export const elapsedPercent = (start: string, end: string) => {
  const total = toTime(end) - toTime(start);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((todayTime() - toTime(start)) / total) * 100));
};

export const daysLabel = (days: number, todayText = "امروز") =>
  days > 0 ? `${days} روز مانده` : days === 0 ? todayText : `${-days} روز گذشته`;
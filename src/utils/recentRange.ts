const toDay = (d: Date) => d.toLocaleDateString("sv-SE");


export function getRecentRange(days: number) {
  const now = Date.now();
  return {
    from: toDay(new Date(now - days * 86_400_000)),
    to: toDay(new Date(now)),
  };
}
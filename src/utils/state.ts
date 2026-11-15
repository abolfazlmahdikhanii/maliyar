export const sumBy = <T>(items: T[], pick: (item: T) => number) =>
  items.reduce((sum, item) => sum + pick(item), 0);


export const percentOf = (part: number, whole: number) =>
  whole ? Math.floor((part / whole) * 100) : 0;
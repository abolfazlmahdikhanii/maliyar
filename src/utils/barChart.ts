export const toFa = (n: number): string => n.toLocaleString("fa-IR");

export const niceStep = (max: number): number => {
  if (max <= 0) return 250;
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return Math.max(1, nice * pow);
};

export const formatTick = (v: number): string => {
  if (v === 0) return "۰";
  if (v >= 1e9) return `${toFa(v / 1e9)}B`;
  if (v >= 1e6) return `${toFa(v / 1e6)}M`;
  if (v >= 1e3) return `${toFa(v / 1e3)}k`;
  return toFa(v);
};

export const roundedTopRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string => {
  if (height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  return `
    M${x},${y + height}
    L${x},${y + r}
    Q${x},${y} ${x + r},${y}
    L${x + width - r},${y}
    Q${x + width},${y} ${x + width},${y + r}
    L${x + width},${y + height}
    Z
  `;
};
export const barWidthFor = (count: number): number => {
  if (count === 7) return 60;
  if (count === 6) return 72;
  return 36;
};

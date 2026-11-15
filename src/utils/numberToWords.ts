const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = [
  "",
  "",
  "بیست",
  "سی",
  "چهل",
  "پنجاه",
  "شصت",
  "هفتاد",
  "هشتاد",
  "نود",
];
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];


function threeDigits(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds) parts.push(HUNDREDS[hundreds]);
  if (rest >= 10 && rest < 20) {
    parts.push(TEENS[rest - 10]);
  } else {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    if (tens) parts.push(TENS[tens]);
    if (ones) parts.push(ONES[ones]);
  }
  return parts.join(" و ");
}


export function numberToWords(input: number): string {
  if (!Number.isFinite(input)) return "";
  const n = Math.floor(Math.abs(input));
  if (n === 0) return "صفر";
  if (n >= 1e15) return "";

  const groups: number[] = [];
  for (let rest = n; rest > 0; rest = Math.floor(rest / 1000)) {
    groups.push(rest % 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (!group) continue;

    if (i === 1 && group === 1) parts.push(SCALES[1]);
    else parts.push(i === 0 ? threeDigits(group) : `${threeDigits(group)} ${SCALES[i]}`);
  }
  return parts.join(" و ");
}
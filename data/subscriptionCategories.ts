export type SubscriptionCategory = {
  id: string;
  label: string;
  bg: string;
  color: string;
};

export const SUBSCRIPTION_CATEGORIES = [
  {
    id: "music",
    label: "موسیقی",
    bg: "rgba(94, 232, 126, 0.12)",
    color: "rgb(94, 232, 126)",
  },
  {
    id: "video",
    label: "فیلم و سریال",
    bg: "rgba(240, 96, 96, 0.12)",
    color: "rgb(240, 96, 96)",
  },
  {
    id: "gaming",
    label: "بازی",
    bg: "rgba(139, 92, 246, 0.12)",
    color: "rgb(139, 92, 246)",
  },
  {
    id: "software",
    label: "نرم‌افزار و ابزار",
    bg: "rgba(73, 154, 240, 0.12)",
    color: "rgb(73, 154, 240)",
  },
  {
    id: "cloud",
    label: "فضای ابری",
    bg: "rgba(79, 221, 209, 0.12)",
    color: "rgb(79, 221, 209)",
  },
  {
    id: "education",
    label: "آموزش",
    bg: "rgba(245, 208, 110, 0.12)",
    color: "rgb(245, 208, 110)",
  },
  {
    id: "news",
    label: "خبر و مجله",
    bg: "rgba(251, 146, 60, 0.12)",
    color: "rgb(251, 146, 60)",
  },
  {
    id: "ai",
    label: "هوش مصنوعی",
    bg: "rgba(236, 72, 153, 0.12)",
    color: "rgb(236, 72, 153)",
  },
  {
    id: "other",
    label: "سایر",
    bg: "rgba(148, 163, 184, 0.12)",
    color: "rgb(148, 163, 184)",
  },
] as const satisfies readonly SubscriptionCategory[];

export type SubscriptionCategoryId =
  (typeof SUBSCRIPTION_CATEGORIES)[number]["id"];

const FALLBACK = SUBSCRIPTION_CATEGORIES[SUBSCRIPTION_CATEGORIES.length - 1];

export const getSubscriptionCategory = (id: string) =>
  SUBSCRIPTION_CATEGORIES.find((c) => c.id === id) ?? FALLBACK;

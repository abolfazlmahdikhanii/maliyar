export type GoalCategory = {
  id: string;
  label: string;
  bg: string;
  color: string;
};

export const GOAL_CATEGORIES = [
  { id: "travel", label: "سفر", bg: "rgba(73, 154, 240, 1)", color: "rgb(73, 154, 240)" },
  { id: "car", label: "خودرو", bg: "rgba(251, 146, 60, 1)", color: "rgb(251, 146, 60)" },
  { id: "home", label: "خانه", bg: "rgba(79, 221, 209, 1)", color: "rgb(79, 221, 209)" },
  { id: "education", label: "آموزش", bg: "rgba(245, 208, 110, 1)", color: "rgb(245, 208, 110)" },
  { id: "wedding", label: "ازدواج", bg: "rgba(236, 72, 153, 1)", color: "rgb(236, 72, 153)" },
  { id: "gadget", label: "لوازم دیجیتال", bg: "rgba(139, 92, 246, 1)", color: "rgb(139, 92, 246)" },
  { id: "emergency", label: "صندوق اضطراری", bg: "rgba(240, 96, 96, 1)", color: "rgb(240, 96, 96)" },
  { id: "other", label: "سایر", bg: "rgba(148, 163, 184, 1)", color: "rgb(148, 163, 184)" },
] as const satisfies readonly GoalCategory[];

const FALLBACK = GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];

export const getGoalCategory = (id: string) =>
  GOAL_CATEGORIES.find((c) => c.id === id) ?? FALLBACK;
import { daysLabel, daysUntil, elapsedPercent } from "./dateMath";

type CheckStatus = "cleared" | "pending" | "bounced";

export const progressCheckDate = (
  dueDate: string,
  issueDate: string,
  status: CheckStatus,
) => (status === "cleared" ? 100 : elapsedPercent(issueDate, dueDate));

export const timeLeftLabel = (
  dueDate: string,
  isPending: boolean,
  statusLabel: string,
) =>
  isPending ? daysLabel(daysUntil(dueDate), "امروز سررسید") : statusLabel;

export const isOverdue = (dueDate: string, isPending: boolean) =>
  isPending && daysUntil(dueDate) < 0;
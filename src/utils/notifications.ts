import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";
import { getCategory } from "../../data/categories";
import { daysLabel, daysUntil } from "./dateMath";

export type Notice = FunctionReturnType<typeof api.notification.list>[number];

export function describeNotice(n: Notice): {
  title: string;
  detail: string;
  danger: boolean;
} {
  if (n.kind === "budget") {
    const label = getCategory(n.categoryId)?.label.trim() ?? n.categoryId;
    return {
      title: `بودجه‌ی ${label} پر شد`,
      detail: `${n.used.toLocaleString("en-US")} از ${n.limit.toLocaleString("en-US")} تومان`,
      danger: true,
    };
  }

  const title =
    n.kind === "check"
      ? n.direction === "received"
        ? `چک دریافتی ${n.party}`
        : `چک پرداختی به ${n.party}`
      : n.kind === "subscription"
        ? `اشتراک ${n.name}`
        : n.kind === "loan"
          ? `قسط وام ${n.title}`
          : n.type === "debt"
            ? `بدهی به ${n.party}`
            : `طلب از ${n.party}`;

  const days = daysUntil(n.dueDate);
  return {
    title,
    detail: `${daysLabel(days)} · ${n.amount.toLocaleString("en-US")} تومان`,
    danger: days < 0,
  };
}
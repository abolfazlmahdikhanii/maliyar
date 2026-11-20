import { ProgressBar } from "@heroui/react";
import { PauseIcon } from "@solar-icons/react/outline";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import { getSubscriptionCategory } from "../../../data/subscriptionCategories";
import { getBankName } from "../../utils/bankDetector";
import { daysLabel, daysUntil, elapsedPercent } from "../../utils/dateMath";
import { formatDate } from "../../utils/formatDate";
import { type subscriptionTimeCycleState } from "../subscription-form/SubscriptionForm";
import SubscriptionFooter from "./elements/SubscriptionFooter";

type Subscription = FunctionReturnType<typeof api.subscriptions.list>[number];

const CYCLE_LABEL: Record<subscriptionTimeCycleState, string> = {
  weekly: "هفتگی",
  monthly: "ماهانه",
  "three-month": "سه ماهه",
  yearly: "سالانه",
};

type SubscriptionBoxProps = {
  subscription: Subscription;
};

const SubscriptionBox = ({ subscription }: SubscriptionBoxProps) => {
  const category = getSubscriptionCategory(subscription.categoryId);
  const bankName = subscription.bank ? getBankName(subscription.bank) : null;
  const isActive = subscription.status === "active";
  const cycleLabel = CYCLE_LABEL[subscription.cycle];
  const days = daysUntil(subscription.nextPaymentDate);
  const progress = elapsedPercent(
    subscription.previousPaymentDate,
    subscription.nextPaymentDate,
  );
  const overdue = days < 0;

  return (
    <div className="box w-full min-w-0 rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-x-3">
          <div
            className="grid size-11 shrink-0 place-items-center rounded-xl border sm:size-12"
            style={{
              background: category.bg,
              color: category.color,
              borderColor: category.color,
            }}
          >
            <span className="text-lg font-semibold sm:text-xl">
              {subscription?.name?.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 space-y-0.75">
            <p className="truncate text-base font-semibold sm:text-lg">
              {subscription?.name}
            </p>
            <p className="truncate text-xs text-muted">
              {category?.label} . {cycleLabel} . {bankName && bankName}
            </p>
          </div>
        </div>

        <div className="shrink-0 space-y-0.75">
          <p className="text-lg font-semibold sm:text-xl">
            {subscription?.amount.toLocaleString() ?? 0}
          </p>
          <p className="text-left text-xs text-muted">تومان / {cycleLabel}</p>
        </div>
      </div>

      <div className="box-date mt-4 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-sm text-muted">
            پرداخت بعدی:{" "}
            <span className="mr-0.5 font-semibold text-white">
              {subscription.nextPaymentDate
                ? formatDate(subscription.nextPaymentDate)
                : "نامشخص"}
            </span>
          </p>
          <div
            className={`rounded-xl border px-2.5 py-1.5 text-xs ${
              isActive
                ? "border-[#ffb86c] bg-[rgba(255,184,108,0.12)] text-[#ffb86c]"
                : "border-secondary bg-surface text-neutral-300"
            }`}
          >
            {isActive ? (
              daysLabel(days)
            ) : (
              <p className="flex items-center gap-x-1.25">
                <PauseIcon size={12} />
                متوقف شده
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar
            aria-label="پیشرفت تا پرداخت بعدی"
            className="w-full"
            value={progress}
          >
            <ProgressBar.Track className="bg-secondary">
              <ProgressBar.Fill
                className="right-0"
                style={{ background: overdue ? "#e85050" : "#dbb848" }}
              />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      </div>

      <SubscriptionFooter subscription={subscription} />
    </div>
  );
};

export default SubscriptionBox;

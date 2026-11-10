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
    <div className="w-full box rounded-2xl">
      <div className="flex items-center justify-between">
        {/* right */}
        <div className="flex gap-x-3">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center border"
            style={{
              background: category.bg,
              color: category.color,
              borderColor: category.color,
            }}
          >
            <span className="text-xl font-semibold ">
              {subscription?.name?.charAt(0)}
            </span>
          </div>
          <div className="space-y-0.75">
            <p className="font-semibold text-lg ">{subscription?.name}</p>
            <p className="text-xs text-muted">
              {category?.label} . {cycleLabel} . {bankName && bankName}
            </p>
          </div>
        </div>
        {/* left */}
        <div className="space-y-0.75">
          <p className="text-xl font-semibold">
            {subscription?.amount.toLocaleString() ?? 0}
          </p>
          <p className="text-muted text-xs text-left">تومان / {cycleLabel}</p>
        </div>
      </div>
      <div className="box-date rounded-2xl mt-4">
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            پرداخت بعدی:{" "}
            <span className="mr-0.5 text-white font-semibold">
              {subscription.nextPaymentDate
                ? formatDate(subscription.nextPaymentDate)
                : "نامشخص"}
            </span>
          </p>
          <div
            className={` px-2.5 border text-xs rounded-xl ${isActive ? "py-1.5 bg-[rgba(255,184,108,0.12)] text-[#ffb86c] border-[#ffb86c]" : "bg-surface border-secondary text-neutral-300 py-1.5"} `}
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
        <div className="mt-4 ">
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

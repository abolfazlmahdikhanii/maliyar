import { Meter } from "@heroui/react";
import {
  ArrowLeftDownIcon,
  ArrowRightUpIcon,
} from "@solar-icons/react/outline";
import type { Doc } from "../../../convex/_generated/dataModel";
import { getBankName } from "../../utils/bankDetector";
import { isOverdue, progressCheckDate, timeLeftLabel } from "../../utils/check";
import { formatDate, formatDueDate } from "../../utils/formatDate";
import { numberToWords } from "../../utils/numberToWords";
import TomanIcon from "../ui/toman-icon/TomanIcon";
import CheckFooter from "./elements/CheckFooter";

const THEME = {
  received: {
    text: "text-primary",
    box: "border-primary bg-[rgba(87,217,119,.09)]",
    line: "from-[rgba(87,217,119,.55)]",
  },
  issued: {
    text: "text-[#f06060]",
    box: "border-[#f06060] bg-[#f060601a]",
    line: "from-[rgba(240,96,96,.55)]",
  },
} as const;

const STATUS_BOX = {
  pending: "border-[#f5d06e] bg-[rgba(245,208,110,.09)] text-[#f5d06e]",
  cleared: "border-primary bg-[rgba(87,217,119,.09)] text-primary",
  bounced: "border-[#f06060] bg-[#f060601a] text-[#f06060]",
} as const;

const MID_TEXT = {
  pending: "text-primary",
  cleared: "text-primary",
  bounced: "text-[#f06060]",
} as const;

type CheckBoxProps = {
  check: Doc<"checks">;
};

const CheckBox = ({ check }: CheckBoxProps) => {
  const isReceived = check.direction === "received";
  const isPending = check.status === "pending";
  const theme = THEME[check.direction];
  const statusLabel =
    check.status === "pending"
      ? "در انتظار"
      : check.status === "bounced"
        ? "برگشتی"
        : isReceived
          ? "وصول شده"
          : "پرداخت شده";
  const midLabel = timeLeftLabel(check.dueDate, isPending, statusLabel);
  const progressPercent = progressCheckDate(
    check.dueDate,
    check.issueDate,
    check.status,
  );
  const overdue = isOverdue(check.dueDate, isPending);
  const isRed = overdue || check.status === "bounced";
  const due = formatDueDate(check.dueDate);
  const stampColor =
    check.status === "bounced" ? "text-[#f06060]" : "text-primary";

  return (
    <div className="box relative min-w-0 rounded-2xl">
      <section className="border-b border-b-secondary pb-4 sm:pb-5">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-secondary pb-4 sm:pb-6">
          <div className="flex min-w-0 items-center gap-x-3">
            <div
              className={`grid size-10.5 shrink-0 place-items-center rounded-[13px] border ${theme.box} ${theme.text}`}
            >
              {isReceived ? (
                <ArrowLeftDownIcon size={18} />
              ) : (
                <ArrowRightUpIcon size={18} />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-y-2">
              <p className="font-extrabold text-neutral-100">
                چک{" "}
                <span className={theme.text}>
                  {isReceived ? "دریافتی" : "پرداختی"}
                </span>
              </p>
              <span
                className={`inline-block h-[1.5px] w-15.5 bg-linear-to-l ${theme.line} to-transparent`}
              />
              <p className="truncate text-xs text-muted">
                بانک{" "}
                <span className="mr-0.5 text-base font-extrabold text-neutral-300">
                  {check.bank
                    ? getBankName(check.bank)?.replace("بانک", "")
                    : "نامشخص"}
                </span>
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-x-4 sm:flex">
            <div className="flex flex-col items-center justify-center gap-y-1.5">
              <p className="text-[10px] text-muted">سریال</p>
              <div className="rounded-xl border border-dashed bg-[#0E1411] px-2.75 py-1.25 text-sm">
                {check.serial ?? ""}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-y-1.5">
              <p className="text-[10px] text-muted">سررسید</p>
              <div className="flex items-center rounded-xl border border-dashed bg-[#0E1411] px-2.75 py-1.25">
                <p className="pl-2.75 pr-px text-sm">{due?.day}</p>
                <p className="border-r border-r-secondary px-2.75 text-sm">
                  {due?.months}
                </p>
                <p className="border-r border-r-secondary pr-2.75 text-sm">
                  {due?.year}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`shrink-0 rounded-full border px-2.75 py-1.5 text-xs sm:hidden ${STATUS_BOX[check.status]}`}
          >
            {statusLabel}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-b-2 border-dashed border-b-secondary pb-3.5 pt-4 sm:ml-8 sm:pt-4.75">
          <div className="min-w-0 space-y-1.25">
            <p className="text-xs text-muted">
              {isReceived ? "صادرکننده" : "در وجه"}
            </p>
            <p className="truncate text-lg font-extrabold text-neutral-200">
              {check.party ?? ""}
            </p>
          </div>
          {check.serial && (
            <p className="shrink-0 text-[11px] text-muted sm:hidden">
              سریال: {check.serial}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-x-3 gap-y-3 pt-4 sm:pt-5">
          <div className="flex min-w-0 flex-col gap-y-3.25">
            <div
              className={`flex w-fit items-center gap-x-1 rounded-xl border py-1.5 pl-5 pr-4 text-xl font-extrabold text-neutral-100 sm:pl-6 sm:pr-5 sm:text-2xl ${theme.box}`}
            >
              {check.amount.toLocaleString() ?? 0}
              <span className="text-neutral-400">
                <TomanIcon width="18" height="18" />
              </span>
            </div>
            <div className="hidden flex-wrap items-center gap-x-1 pr-2 sm:flex">
              <p className="text-[12px] font-bold text-muted">مبلغ به حروف:</p>
              <p className="text-[12px] text-muted">
                {check.amount ? numberToWords(check.amount) : "صفر"} تومان
              </p>
            </div>
          </div>

          <div
            className={`hidden w-fit shrink-0 rounded-full border px-2.75 py-1.5 text-xs sm:block ${STATUS_BOX[check.status]}`}
          >
            {statusLabel}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-y-3.5 px-1 pb-5 pt-4 sm:px-2 sm:pb-7 sm:pt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center justify-center gap-y-1">
            <p className="text-[10px] text-muted">صدور</p>
            <p className="to-neutral-100 text-xs font-semibold">
              {formatDate(check.issueDate)}
            </p>
          </div>
          <p
            className={`text-center text-xs font-semibold ${overdue ? "text-[#f06060]" : MID_TEXT[check.status]}`}
          >
            {midLabel}
          </p>
          <div className="flex flex-col items-center justify-center gap-y-1">
            <p className="text-[10px] text-muted">سررسید</p>
            <p className="to-neutral-100 text-xs font-semibold">
              {formatDate(check.dueDate)}
            </p>
          </div>
        </div>
        <div className="w-full">
          <Meter
            aria-label="Storage"
            className="w-full"
            dir="rtl"
            value={progressPercent}
          >
            <Meter.Track className="bg-secondary">
              <Meter.Fill
                className={`left-[unset] right-0 ${isRed ? "bg-[#f06060]" : "bg-primary"}`}
              />
            </Meter.Track>
          </Meter>
        </div>
      </section>

      <CheckFooter check={check} />

      {!isPending && (
        <div className="pointer-events-none absolute left-1/2 top-[33%] w-fit -translate-x-1/2 rotate-[-13deg] select-none">
          <div
            className={`rounded-2xl border-[3px] border-current p-1 ${stampColor}`}
          >
            <div className="rounded-xl border border-current px-5 py-2 sm:px-7 sm:py-2.5">
              <span className="text-xl font-extrabold sm:text-2xl">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckBox;
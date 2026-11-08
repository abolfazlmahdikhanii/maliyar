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
    <div className="box rounded-2xl relative">
      <section className="pb-5 border-b border-b-secondary">
        <div className="flex justify-between border-b border-secondary border-dashed pb-6">
          {/* right */}
          <div className="flex items-center gap-x-3">
            <div
              className={`w-10.5 h-10.5 border ${theme.box} ${theme.text} grid place-items-center rounded-[13px]`}
            >
              {isReceived ? (
                <ArrowLeftDownIcon size={18} />
              ) : (
                <ArrowRightUpIcon size={18} />
              )}
            </div>
            <div className="flex flex-col gap-y-2">
              <p className="font-extrabold text-neutral-100">
                چک{" "}
                <span className={theme.text}>
                  {isReceived ? "دریافتی" : "پرداختی"}
                </span>
              </p>
              <span
                className={`h-[1.5px] w-15.5 inline-block bg-linear-to-l ${theme.line} to-transparent`}
              ></span>
              <p className="text-xs text-muted">
                بانک{" "}
                <span className="text-base text-neutral-300 font-extrabold mr-0.5">
                  {check.bank ? getBankName(check.bank)?.replace("بانک","") : "نامشخص"}
                </span>
              </p>
            </div>
          </div>
          {/* left */}
          <div className="flex items-center gap-x-4">
            <div className="flex flex-col gap-y-1.5 items-center justify-center">
              <p className="text-[10px] text-muted">سریال</p>
              <div className="bg-[#0E1411] px-2.75 py-1.25  text-sm rounded-xl border border-dashed">
                {check.serial ?? ""}
              </div>
            </div>
            <div className="flex flex-col gap-y-1.5 items-center justify-center">
              <p className="text-[10px] text-muted">سررسید</p>
              <div className="bg-[#0E1411] px-2.75 py-1.25  rounded-xl border border-dashed flex items-center">
                <p className=" pl-2.75 pr-px text-sm">{due?.day}</p>
                <p className="border-r border-r-secondary px-2.75 text-sm">
                  {due?.months}
                </p>
                <p className="border-r border-r-secondary pr-2.75 text-sm">
                  {due?.year}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4.75 pb-3.5 border-b-2 border-dashed border-b-secondary space-y-1.25 ml-8">
          <p className="text-muted text-xs">
            {" "}
            {isReceived ? "صادرکننده" : "در وجه"}
          </p>
          <p className="font-extrabold text-lg text-neutral-200">
            {check.party ?? ""}
          </p>
        </div>
        <div className="pt-5  flex items-baseline justify-between">
          <div className="flex flex-col gap-y-3.25">
            <div
              className={`py-1.5 pr-5 pl-6 rounded-xl w-fit border  text-2xl flex items-center gap-x-1 font-extrabold text-neutral-100 ${theme.box}`}
            >
              {check.amount.toLocaleString() ?? 0}
              <span className="text-neutral-400">
                <TomanIcon width="18" height="18" />
              </span>
            </div>
            <div className="flex items-center gap-x-1 pr-2">
              <p className="text-[12px] text-muted font-bold">مبلغ به حروف:</p>
              <p className="text-[12px] text-muted">
                {check.amount ? numberToWords(check.amount) : "صفر"} تومان
              </p>
            </div>
          </div>
          <div
            className={`border py-1.5 px-2.75 rounded-full w-fit text-xs ${STATUS_BOX[check.status]}`}
          >
            {statusLabel}
          </div>
        </div>
      </section>
      <section className="pt-5 pb-7  px-2 flex flex-col gap-y-3.5 ">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1 items-center justify-center">
            <p className="text-[10px] text-muted">صدور</p>
            <p className="text-xs to-neutral-100 font-semibold">
              {formatDate(check.issueDate)}
            </p>
          </div>
          <div className="">
            <p
              className={`text-xs font-semibold ${overdue ? "text-[#f06060]" : MID_TEXT[check.status]}`}
            >
              {midLabel}
            </p>
          </div>
          <div className="flex flex-col gap-y-1 items-center justify-center">
            <p className="text-[10px] text-muted">سررسید</p>
            <p className="text-xs to-neutral-100 font-semibold">
              {" "}
              {formatDate(check.dueDate)}
            </p>
          </div>
        </div>
        <div className="w-full">
          <Meter
            aria-label="Storage"
            className="w-full "
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
        <div className="pointer-events-none select-none absolute top-[33%] left-1/2 -translate-x-1/2 rotate-[-13deg] w-fit">
          <div
            className={`rounded-2xl border-[3px] border-current p-1 ${stampColor}`}
          >
            <div className="rounded-xl border border-current px-7 py-2.5">
              <span className="text-2xl font-extrabold">{statusLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckBox;

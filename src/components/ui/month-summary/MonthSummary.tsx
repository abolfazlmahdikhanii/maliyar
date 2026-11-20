import { AltArrowLeftIcon } from "@solar-icons/react/outline";
import TomanIcon from "../toman-icon/TomanIcon";

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

type MonthSummaryProps = {
  year: number;
  month: number;
  income: number;
  outcome: number;
  loading: boolean;
  isCurrentMonth: boolean;
  onChangeMonth: (delta: number) => void;
};

const MonthSummary = ({
  year,
  month,
  income,
  outcome,
  loading,
  isCurrentMonth,
  onChangeMonth,
}: MonthSummaryProps) => {
  const net = income - outcome;

  const glowColor = loading
    ? "bg-white/5"
    : net < 0
      ? "bg-[#f06060]/20"
      : "bg-[#A3E96B]/20";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#1B1B20] p-4">
  
      <div
        className={`pointer-events-none absolute -right-10 -top-10 size-44 rounded-full blur-3xl ${glowColor}`}
      />

      <div className="relative">
 
        <div className="flex items-center justify-between rounded-full bg-white/5 p-1">
          <button
            type="button"
            aria-label="ماه قبل"
            onClick={() => onChangeMonth(-1)}
            className="grid size-9 place-items-center rounded-full text-white/70 active:bg-white/10"
          >
            <AltArrowLeftIcon size={18} className="rotate-180" />
          </button>

          <p className="text-sm font-medium text-white">
            {MONTH_NAMES[month - 1]} {year}
          </p>

          <button
            type="button"
            aria-label="ماه بعد"
            disabled={isCurrentMonth}
            onClick={() => onChangeMonth(1)}
            className="grid size-9 place-items-center rounded-full text-white/70 active:bg-white/10 disabled:opacity-25"
          >
            <AltArrowLeftIcon size={18} />
          </button>
        </div>

       
        <p className="mt-6 text-sm text-white/50">مانده‌ی این ماه</p>
        {loading ? (
          <div className="mt-2 h-11 w-48 animate-pulse rounded-lg bg-white/10" />
        ) : (
          <p
            className={`mt-1 flex items-center gap-x-1 text-4xl font-semibold ${
              net < 0 ? "text-[#f06060]" : "text-[#A3E96B]"
            }`}
          >
            <span dir="ltr">
              {net < 0 ? "-" : ""}
              {Math.abs(net).toLocaleString("en-US")}
            </span>
            <TomanIcon width="22" height="22" />
          </p>
        )}

       
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <span className="size-2 rounded-full bg-[#A3E96B]" />
              درآمد
            </div>
            <p className="mt-1.5 text-base font-semibold text-white">
              {loading ? "—" : income.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <span className="size-2 rounded-full bg-[#f06060]" />
              هزینه
            </div>
            <p className="mt-1.5 text-base font-semibold text-white">
              {loading ? "—" : outcome.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthSummary;
import {
  ArrowLeftDownIcon,
  ArrowLeftUpIcon,
  CardSendIcon,
} from "@solar-icons/react/outline";
import type { StatGroup } from "../../hooks/useMonthStats";
import CurveBox from "../ui/curve-box/CurveBox";
import TomanIcon from "../ui/toman-icon/TomanIcon";

type ExpenseProps = {
  total?: number;
  change?: number | null;
  groups?: StatGroup[];
  loading?: boolean;
};

const Expense = ({ total, change, groups = [], loading }: ExpenseProps) => {
  const sum = groups.reduce((s, g) => s + g.value, 0);
  const up = change != null && change > 0;
  const down = change != null && change < 0;
  return (
    <CurveBox>
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full text-white">
              <CardSendIcon size={24} />
            </div>
            <p className="text-white text-lg sm:text-[21px]">مجموع هزینه</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 mt-5 sm:mt-6 mr-2">
            <p className="text-white font-semibold text-3xl sm:text-[40px] flex items-center gap-x-1">
              {loading || total === undefined
                ? "—"
                : total.toLocaleString("en-US")}
              <span className="text-neutral-400">
                <TomanIcon width="22" height="22" />
              </span>
            </p>

            {!loading && change != null && (
              <div
                dir="ltr"
                title={`${Math.abs(change)}٪ ${up ? "بیشتر" : "کمتر"} از ماه قبل`}
                aria-label={`هزینه ${Math.abs(change)} درصد ${up ? "بیشتر" : "کمتر"} از ماه قبل`}
                className={`flex items-center gap-x-1 px-2.5 py-1.25 text-xs rounded-full ${
                  down
                    ? "bg-[#f06060] text-white"
                    : "bg-primary text-neutral-700"
                }`}
              >
                {up && <ArrowLeftUpIcon size={12} strokeWidth={2} />}
                {down && <ArrowLeftDownIcon size={12} strokeWidth={2} />}
                {up ? "+" : down ? "-" : ""} {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-y-5 sm:gap-y-6.5 pb-1 pr-2">
          {sum === 0 ? (
            <>
              <div className="bg-secondary h-3 w-full rounded-full mt-5" />
              {!loading && (
                <p className="text-sm text-neutral-400 text-center">
                  هزینه‌ای در این ماه ثبت نشده
                </p>
              )}
            </>
          ) : (
            <>
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: groups
                    .map((g) => `minmax(0, ${g.value}fr)`)
                    .join(" "),
                }}
              >
                {groups.map((g) => (
                  <div
                    key={g.label}
                    className="flex flex-col items-center justify-center gap-1.75"
                  >
                    <p className="text-xs text-neutral-300">
                      {Math.round((g.value / sum) * 100)}%
                    </p>
                    <div
                      className="h-3 w-full rounded-full"
                      style={{ background: g.color }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-evenly gap-x-4 gap-y-2">
                {groups.map((g) => (
                  <div key={g.label} className="flex items-center gap-x-2">
                    <p
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: g.color }}
                    />
                    <p className="text-sm text-neutral-300">{g.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </CurveBox>
  );
};

export default Expense;
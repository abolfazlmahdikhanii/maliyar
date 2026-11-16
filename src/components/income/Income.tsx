import { CardReceiveIcon } from "@solar-icons/react/outline";
import type { StatGroup } from "../../hooks/useMonthStats";
import CurveBox from "../ui/curve-box/CurveBox";
import TomanIcon from "../ui/toman-icon/TomanIcon";

type IncomeProps = {
  total?: number;
  change?: number | null;
  groups?: StatGroup[];
  loading?: boolean;
};

const Income = ({ total, change, groups = [], loading }: IncomeProps) => (
  <CurveBox>
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full text-white">
            <CardReceiveIcon size={24} />
          </div>
          <p className="text-white text-[21px]">مجموع درآمد</p>
        </div>
        <div className="flex items-center gap-x-3.5 mt-6 mr-2">
          <p className="text-white font-semibold text-[40px] flex items-center gap-x-1">
            {loading || total === undefined
              ? "—"
              : total.toLocaleString("en-US")}
            <span className="text-neutral-400">
              <TomanIcon width="22" height="22" />
            </span>
          </p>
          {!loading && change != null && (
            <div
              className={`flex items-center justify-center px-2.5 py-1.25 text-xs rounded-full ${
                change < 0
                  ? "bg-[#f06060] text-white"
                  : "bg-primary text-neutral-700"
              }`}
            >
              {change > 0 && "+"}
              {change < 0 && "-"}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-x-16 pb-1 pr-2 min-h-14">
        {!loading && groups.length === 0 && (
          <p className="text-sm text-neutral-400">درآمدی در این ماه ثبت نشده</p>
        )}
        {groups.map((g) => (
          <div key={g.label} className="flex items-center gap-x-4">
            <p
              className="h-14 w-0.75 rounded-full"
              style={{ background: g.color }}
            />
            <div>
              <p className="text-neutral-400">{g.label}</p>
              <p className="text-[21px] text-neutral-100 mt-1">
                {g.value.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </CurveBox>
);

export default Income;

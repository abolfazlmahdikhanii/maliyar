import {
  ArrowLeftDownIcon,
  ArrowRightUpIcon,
} from "@solar-icons/react/outline";
import { useMemo } from "react";
import { getCategory } from "../../../../../data/categories";
import { formatDay } from "../../../../utils/formatDate";

type AccountTransactionProps = {
  type: "income" | "outcome";
  title?: string;
  categoryId: string;
  date: string;
  amount: number;
};

const AccountTransaction = ({
  type,
  title,
  categoryId,
  date,
  amount,
}: AccountTransactionProps) => {
  const category = useMemo(() => getCategory(categoryId), [categoryId]);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-x-2.75">
        <div
          className={`grid size-9.5 shrink-0 place-items-center rounded-xl ${
            type === "outcome"
              ? "bg-[#ff6b6b1f] text-[#ff6b6b]"
              : "bg-[#9fe86f1f] text-primary"
          }`}
        >
          {type === "outcome" ? (
            <ArrowRightUpIcon size={17} strokeWidth={3} />
          ) : (
            <ArrowLeftDownIcon size={17} strokeWidth={3} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-y-1.5">
          <p className="truncate text-[13px] font-semibold text-white">
            {title ? title : category?.label}
          </p>
          <p className="truncate text-[11px] text-muted">
            {category?.label} . {date ? formatDay(date) : ""}
          </p>
        </div>
      </div>
      <p
        className={`${
          type === "income" ? "text-primary" : "text-[#ff6b6b]"
        } flex shrink-0 items-center gap-x-1 text-sm font-semibold tracking-wide sm:text-base`}
      >
        {amount?.toLocaleString()}
        {type === "income" ? "+" : "-"}
      </p>
    </div>
  );
};

export default AccountTransaction;
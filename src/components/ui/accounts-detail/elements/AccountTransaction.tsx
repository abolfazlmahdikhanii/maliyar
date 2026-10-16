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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-2.75">
        <div
          className={`w-9.5 h-9.5 rounded-xl grid place-items-center ${
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
        <div className="flex-col flex gap-y-1.5">
          <p className="text-[13px] text-white font-semibold">
            {title ? title : category?.label}
          </p>
          <p className="text-muted text-[11px]">
            {category?.label} . {date ? formatDay(date) : ""}{" "}
          </p>
        </div>
      </div>
      <p
        className={`${
          type === "income" ? "text-primary" : "text-[#ff6b6b]"
        } font-semibold text-base flex items-center gap-x-1 tracking-wide`}
      >
        {amount?.toLocaleString()}
        {type === "income" ? "+" : "-"}
      </p>
    </div>
  );
};

export default AccountTransaction;

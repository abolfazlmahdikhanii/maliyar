import type { Icon } from "@solar-icons/react/lib/types";

type TransactionDetailItemProps = {
  icon: Icon;
  title: string;
  value: string;
  style?: string;
  isNote?: boolean;
};

const TransactionDetailItem = ({
  icon,
  title,
  value,
  style,
  isNote = false,
}: TransactionDetailItemProps) => {
  const Icon = icon;

  return (
    <div
      className={`flex border-y border-secondary px-2 py-3.5 last:border-b-0 sm:px-4 sm:py-4 ${
        isNote ? "flex-col gap-y-2" : "items-center justify-between gap-3"
      }`}
    >
      <div className="flex shrink-0 items-center gap-x-2.5 text-neutral-400">
        <Icon size={23} />
        <p className="text-sm">{title}</p>
      </div>
      <p
        className={`min-w-0 wrap-break-words text-sm sm:text-base ${
          style ? style : "text-neutral-100"
        } ${isNote ? "px-7" : "text-left"}`}
      >
        {value}
      </p>
    </div>
  );
};

export default TransactionDetailItem;
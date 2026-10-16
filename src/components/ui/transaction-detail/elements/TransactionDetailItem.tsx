import type { Icon } from "@solar-icons/react/lib/types";

type TransactionDetailItemProps = {
  icon: Icon;
  title: string;
  value: string;
  style?: string;
  isNote?:boolean
};

const TransactionDetailItem = ({
  icon,
  title,
  value,
  style,
  isNote=false
}: TransactionDetailItemProps) => {
  const Icon = icon;
  return (
    <div className={`flex ${isNote?"flex-col gap-y-2":"items-center justify-between"} py-4 px-4 border-y last:border-b-0 border-secondary`}>
      <div className="flex items-center gap-x-2.5 text-neutral-400">
        <Icon size={23} />
        <p className="text-sm">{title}</p>
      </div>
      <p className={`text-base ${style ? style : "text-neutral-100"} ${isNote?"px-7":""}`}>
        {value}
      </p>
    </div>
  );
};

export default TransactionDetailItem;

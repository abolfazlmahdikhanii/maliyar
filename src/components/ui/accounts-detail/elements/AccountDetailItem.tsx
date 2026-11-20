import type { Icon } from "@solar-icons/react/lib/types";

type AccountDetailItemProps = {
  icon: Icon;
  title: string;
  value: string;
  style?: string;
  noBorder?: boolean;
  dir?: string;
};

const AccountDetailItem = ({
  icon,
  title,
  value,
  style,
  noBorder = false,
  dir = "rtl",
}: AccountDetailItemProps) => {
  const Icon = icon;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-2 py-3.5 sm:px-4 sm:py-4.5 ${
        !noBorder ? "border-b border-secondary" : ""
      }`}
    >
      <div className="flex shrink-0 items-center gap-x-2.5 text-neutral-400">
        <div className="grid size-8.5 place-items-center rounded-xl border border-secondary bg-surface">
          <Icon size={20} />
        </div>
        <p className="text-xs">{title}</p>
      </div>
      <p
        className={`min-w-0 break-all text-left ${
          style ? style : "text-sm font-semibold text-neutral-100 sm:text-[15px]"
        }`}
        dir={dir}
      >
        {value}
      </p>
    </div>
  );
};

export default AccountDetailItem;
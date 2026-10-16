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
      className={`flex items-center justify-between py-4.5 px-4 ${!noBorder ? "border-b border-secondary" : ""}`}
    >
      <div className="flex items-center gap-x-2.5 text-neutral-400 ">
        <div className="w-8.5 h-8.5 rounded-xl bg-surface border border-secondary grid place-items-center">
          <Icon size={20} />
        </div>
        <p className="text-xs">{title}</p>
      </div>
      <p
        className={` ${
          style ? style : "text-[15px] text-neutral-100 font-semibold"
        }`}
        dir={dir}
      >
        {value}
      </p>
    </div>
  );
};

export default AccountDetailItem;

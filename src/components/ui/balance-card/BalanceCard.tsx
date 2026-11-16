import { Button } from "@heroui/react";
import { ArrowLeftDownIcon, ArrowLeftUpIcon } from "@solar-icons/react/outline";
import TomanIcon from "../toman-icon/TomanIcon";

type BalanceCardProps = {
  balance?: number;
  change?: number | null;
  loading?: boolean;
  onOpen?: () => void;
};

const BalanceCard = ({
  balance,
  change,
  loading,
  onOpen,
}: BalanceCardProps) => {
  const Arrow =
    change != null && change < 0 ? ArrowLeftDownIcon : ArrowLeftUpIcon;
  const sign =
    change != null && change > 0
      ? "+"
      : change != null && change < 0
        ? "-"
        : "";

  return (
    <div className="relative w-full">
      <div className="absolute -top-10 inset-x-6 filter-[drop-shadow(0_-2px_3px_rgba(0,0,0,0.2))]">
        <div className="w-full h-36 bg-indigo-500 brightness-90 border-t border-white/30 inverted-radius-3" />
      </div>

      <div className="absolute -top-5 inset-x-3 filter-[drop-shadow(0_-3px_5px_rgba(0,0,0,0.25))]">
        <div className="w-full h-36 bg-yellow-500 brightness-95 border-t border-white/40 inverted-radius-2" />
      </div>

      <div className="relative filter-[drop-shadow(0_-4px_7px_rgba(0,0,0,0.3))]">
        <div className="inverted-radius w-full h-70 bg-primary">
          <div className="pr-6.75 pt-7 pb-6.5 flex flex-col justify-between h-full">
            <p className="text-[24px] text-neutral-800">موجودی کل</p>
            <div>
              {loading ? (
                <div className="h-12 w-56 rounded-lg bg-black/10 animate-pulse" />
              ) : (
                <p className="text-black font-semibold text-[47px] flex items-center gap-x-1">
                  {(balance ?? 0).toLocaleString("en-US")}
                  <TomanIcon width="24" height="24" />
                </p>
              )}

              {!loading && change != null && (
                <div className="flex items-center gap-x-3 mt-1.5">
                  <div className="flex items-center justify-center px-3 py-1.25 bg-[#d9f6c6b3] rounded-full w-fit gap-x-0.75 text-neutral-700">
                    <p className="text-sm">{`${sign}%${Math.abs(change)}`}</p>
                    <Arrow size={15} className="-mt-0.5" strokeWidth={2} />
                  </div>
                  <p className="text-sm text-neutral-700">نسبت به ماه قبل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        isIconOnly
        aria-label="مشاهده حساب‌ها"
        className="absolute -top-1 left-3.25 bg-white w-13.75 h-13.75 rounded-full text-black"
        onPress={onOpen}
      >
        <ArrowLeftUpIcon size={24} />
      </Button>
    </div>
  );
};

export default BalanceCard;

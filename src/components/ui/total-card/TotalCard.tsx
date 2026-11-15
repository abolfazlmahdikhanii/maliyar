import { ArrowLeftDownIcon, ArrowLeftUpIcon } from "@solar-icons/react/outline";

type TotalCardProps = {
  title?: string;
  count?: number;
  change?: number | null; 
  loading?: boolean;
};

const TotalCard = ({
  title = "تعداد تراکنش‌های ماه",
  count,
  change,
  loading,
}: TotalCardProps) => {
  const Arrow = change != null && change < 0 ? ArrowLeftDownIcon : ArrowLeftUpIcon;
  const sign = change != null && change > 0 ? "+" : change != null && change < 0 ? "-" : "";

  return (
    <div>
      <div className="relative w-full">
        <div className="inverted-radius w-full h-70 bg-primary">
          <div className="pr-6.75 pt-7 pb-6.5 flex flex-col justify-between h-full">
            <p className="text-[24px] text-neutral-800">{title}</p>
            <div>
              <p className="text-black font-semibold text-[47px] flex items-center gap-x-1">
                {loading || count === undefined ? "—" : count.toLocaleString("en-US")}
                <span className="text-xl text-neutral-800">تراکنش</span>
              </p>
              <div className="flex items-center gap-x-3 mt-1.5">
                {!loading && change != null ? (
                  <>
                    <div className="flex items-center justify-center px-3 py-1.25 bg-[#d9f6c6b3] rounded-full w-fit gap-x-0.75 text-neutral-700">
                      <p className="text-sm">{`${sign}%${Math.abs(change)}`}</p>
                      <Arrow size={15} className="-mt-0.5" strokeWidth={2} />
                    </div>
                    <p className="text-sm text-neutral-700">نسبت به ماه قبل</p>
                  </>
                ) : (
                  !loading && (
                    <p className="text-sm text-neutral-700">ماه قبل تراکنشی نداشتی</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCard;
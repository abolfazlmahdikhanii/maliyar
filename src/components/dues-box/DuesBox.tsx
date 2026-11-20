import { Button, IconChevronLeft } from "@heroui/react";
import { CalendarIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { getDuesStatus } from "../../utils/duesStatus";
import { formatDate } from "../../utils/formatDate";
import type { DuesData } from "../../validators/dues";
import DuesDetailModal from "../ui/dues-detail-modal/DuesDetailModal";
import PayDue from "../ui/dues-detail-modal/elements/pay-due/PayDue";
import DuesStatus from "../ui/dues-status/DuesStatus";
import TomanIcon from "../ui/toman-icon/TomanIcon";

export type Dues = {
  status: "open" | "paid";
  bank: string;
  _id: Id<"dues">;
} & DuesData;

type DuesBoxProps = {
  dues: Dues;
};

const DuesBox = ({ dues }: DuesBoxProps) => {
  const [isOpenDetailModal, setIsOpenDetailModal] = useState<boolean>(false);

  return (
    <div className="box min-w-0 rounded-2xl">
     
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl border font-semibold sm:size-14 ${
            dues?.type === "claim"
              ? "border-primary bg-primary/15 text-primary"
              : "border-[#f06060] bg-[#f060601a] text-[#f06060]"
          }`}
        >
          <p className="text-lg sm:text-xl">{dues?.party?.charAt(0)}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <p className="w-full truncate text-base font-semibold sm:text-[17px]">
            {dues?.party}
          </p>
          <DuesStatus
            status={getDuesStatus({
              status: dues.status,
              dueDate: dues.dueDate,
            })}
          />
        </div>

        <p
          className={`${
            dues?.type === "debt" ? "text-[#ff6b6b]" : "text-primary"
          } flex shrink-0 items-center gap-x-1 text-lg font-semibold sm:text-[26px]`}
        >
          {dues?.amount?.toLocaleString()}
          <span className="text-neutral-400">
            <TomanIcon width="18" height="18" />
          </span>
        </p>
      </div>

    
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-t-secondary pt-4">
        <div className="flex items-center gap-x-1.5 text-muted">
          <CalendarIcon size={15} />
          <p className="text-xs">
            سررسید : <span>{dues?.dueDate && formatDate(dues?.dueDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-x-2 sm:gap-x-2.75">
          {dues?.status === "open" && (
            <PayDue
              key={dues._id}
              dueId={dues._id}
              style="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-black sm:h-10.5 sm:px-5"
              minBalance={dues.type === "debt" ? dues.amount : 0}
            />
          )}

          <Button
            isIconOnly
            className="size-9 rounded-full bg-secondary sm:size-10.5"
            onPress={() => setIsOpenDetailModal(true)}
          >
            <IconChevronLeft width={18} height={18} />
          </Button>
        </div>
      </div>

      <DuesDetailModal
        key={dues._id}
        isOpen={isOpenDetailModal}
        onOpenChange={() => setIsOpenDetailModal(false)}
        detail={dues}
      />
    </div>
  );
};

export default DuesBox;
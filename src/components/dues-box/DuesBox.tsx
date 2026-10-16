import { Button, IconChevronLeft } from "@heroui/react";
import { BellIcon, CalendarIcon } from "@solar-icons/react/outline";
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
  _id: Id<"dues">;
} & DuesData;

type DuesBoxProps = {
  dues: Dues;
};
const DuesBox = ({ dues }: DuesBoxProps) => {
  const [isOpenDetailModal, setIsOpenDetailModal] = useState<boolean>(false);
  
  return (
    <div className="box rounded-2xl flex ">
      <div
        className={`rounded-2xl font-semibold grid place-items-center ${dues?.type === "claim" ? "bg-primary/15 border border-primary text-primary" : "bg-[#f060601a] text-[#f06060] border border-[#f06060]"} w-16 h-14`}
      >
        <p className="text-xl">{dues?.party?.charAt(0)}</p>
      </div>
      <div className=" mr-5 w-full pl-2">
        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center gap-3">
            <p className="font-semibold text-[17px]">{dues?.party}</p>

            <DuesStatus
              status={getDuesStatus({
                status: dues.status,
                dueDate: dues.dueDate,
              })}
            />
          </div>
          <div>
            <p
              className={`${dues?.type === "debt" ? "text-[#ff6b6b]" : "text-primary"} font-semibold text-[26px] flex items-center gap-x-1`}
            >
              {dues?.amount?.toLocaleString()}{" "}
              <span className="text-neutral-400">
                <TomanIcon width="18" height="18" />
              </span>
            </p>
          </div>
        </div>
        <div className="border-t border-t-secondary mt-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 text-muted px-2.75 py-1.25 bg-[#202025] border border-secondary rounded-lg">
            <CalendarIcon size={14} />
            <p className="text-xs ">
              سررسید : <span>{dues?.dueDate && formatDate(dues?.dueDate)}</span>
            </p>
          </div>
          <div className="flex items-center gap-x-2.75">
            {dues?.status === "open" && (
              <PayDue
                key={dues._id}
                dueId={dues._id}
                style="bg-primary text-black h-10.5 px-5"
              />
            )}
            <Button
              isIconOnly
              className="w-10.5 h-10.5 rounded-full bg-secondary "
            >
              <BellIcon size={18} />
            </Button>
            <Button
              isIconOnly
              className="w-10.5 h-10.5 rounded-full bg-secondary "
              onClick={() => setIsOpenDetailModal(true)}
            >
              <IconChevronLeft width={18} height={18} />
            </Button>
          </div>
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

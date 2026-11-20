import { Button, IconChevronLeft } from "@heroui/react";
import { BagSmileIcon } from "@solar-icons/react/outline";
import { useMemo, useState } from "react";
import { getCategory } from "../../../../data/categories";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getBankName } from "../../../utils/bankDetector";
import { formatDay } from "../../../utils/formatDate";
import type { TransactionData } from "../../../validators/transactions";
import TomanIcon from "../toman-icon/TomanIcon";
import TransactionDetailModal from "../transaction-detail/TransactionDetailModal";

type TransactionItemProps = {
  transaction: TransactionData;
  isBorder?: boolean;
  bank: string;
  id: Id<"transactions">;
};

const TransactionItem = ({
  bank,
  id,
  transaction: t,
  isBorder = false,
}: TransactionItemProps) => {
  const [isOpenDetailModal, setIsOpenDetailModal] = useState<boolean>(false);
  const category = useMemo(() => getCategory(t?.categoryId), [t.categoryId]);

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3.5 transition-all duration-200 sm:px-4.5 sm:py-4.5 ${
          isBorder ? "box" : ""
        }`}
        onClick={() => setIsOpenDetailModal(true)}
      >
      
        <div className="flex min-w-0 items-center gap-x-3 sm:gap-x-3.5">
          <div className="grid size-11 shrink-0 place-content-center rounded-full bg-secondary sm:size-13">
            {category ? (
              <category.icon size={24} />
            ) : (
              <BagSmileIcon size={24} />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-y-1">
            <p className="truncate text-sm sm:text-base">
              {t?.title || category?.label}
            </p>
            <div className="flex items-center gap-x-2 text-xs text-neutral-400 sm:text-[13px]">
              <p className="hidden truncate sm:block">{getBankName(bank)}</p>
              <span className="hidden size-1 shrink-0 rounded-full bg-neutral-500 sm:inline-block" />
              <p className="shrink-0">
                {t?.date ? formatDay(t?.date) || "" : "__"} {t?.time ?? ""}
              </p>
            </div>
          </div>
        </div>

       
        <div className="flex shrink-0 items-center gap-x-4.5">
          <div
            className={`flex items-center gap-x-1 ${
              t?.type === "income" ? "text-primary" : "text-[#e85050]"
            }`}
          >
            <p className="text-[15px] font-semibold sm:text-lg">
              {t?.amount?.toLocaleString()}
            </p>
            <span className="sm:block hidden">
              <TomanIcon width="16" height="16" />
            </span>
             <span className="block sm:hidden">
              <TomanIcon width="15" height="15" />
            </span>
          </div>

          <Button
            isIconOnly
            className="hidden size-8 rounded-full bg-secondary sm:flex"
          >
            <IconChevronLeft />
          </Button>
        </div>
      </div>

      <TransactionDetailModal
        transaction={t}
        isOpen={isOpenDetailModal}
        onOpenChange={() => setIsOpenDetailModal(false)}
        bank={bank}
        transactionId={id}
        category={category}
      />
    </div>
  );
};

export default TransactionItem;
import { Button, IconChevronLeft } from "@heroui/react";
import { BagSmileIcon } from "@solar-icons/react/outline";
import { useMemo, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getCategory } from "../../../../data/categories";
import { getBankName } from "../../../utils/bankDetector";
import { formatDay } from "../../../utils/formatDate";
import type { TransactionData } from "../../../validators/transactions";
import TomanIcon from "../toman-icon/TomanIcon";
import TransactionDetailModal from "../transaction-detail/TransactionDetailModal";

type TransactionItemProps = {
  transaction: TransactionData;
  isBorder?: boolean;
  tile?: boolean;
  bank: string;
  id: Id<"transactions">;
};

const TransactionItem = ({
  bank,
  id,
  transaction: t,
  isBorder = false,
  tile = false,
}: TransactionItemProps) => {
  const [isOpenDetailModal, setIsOpenDetailModal] = useState<boolean>(false);
  const category = useMemo(() => getCategory(t?.categoryId), [t.categoryId]);

  const amountColor = t?.type === "income" ? "text-primary" : "text-[#e85050]";
  const dateText = `${t?.date ? formatDay(t?.date) || "" : "__"} ${t?.time ?? ""}`;
  const icon = category ? (
    <category.icon size={24} />
  ) : (
    <BagSmileIcon size={24} />
  );

  return (
    <div className="min-w-0">
      <div
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3.5 transition-all duration-200 sm:px-4.5 sm:py-4.5 ${
          isBorder ? "box" : ""
        } ${tile ? "lg:hidden" : ""}`}
        onClick={() => setIsOpenDetailModal(true)}
      >
        <div className="flex min-w-0 items-center gap-x-3 sm:gap-x-3.5">
          <div className="grid size-11 shrink-0 place-content-center rounded-full bg-secondary sm:size-13">
            {icon}
          </div>

          <div className="flex min-w-0 flex-col gap-y-1">
            <p className="truncate text-sm sm:text-base">
              {t?.title || category?.label}
            </p>
            <div className="flex items-center gap-x-2 text-xs text-neutral-400 sm:text-[13px]">
              <p className="hidden truncate sm:block">{getBankName(bank)}</p>
              <span className="hidden size-1 shrink-0 rounded-full bg-neutral-500 sm:inline-block" />
              <p className="shrink-0">{dateText}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-x-4.5">
          <div className={`flex items-center gap-x-1 ${amountColor}`}>
            <p className="text-[15px] font-semibold sm:text-lg">
              {t?.amount?.toLocaleString()}
            </p>
            <TomanIcon width="15" height="15" />
          </div>

          <Button
            isIconOnly
            className="hidden size-8 rounded-full bg-secondary sm:flex"
          >
            <IconChevronLeft />
          </Button>
        </div>
      </div>

      {tile && (
        <div
          className={`hidden cursor-pointer flex-col gap-4 rounded-2xl bg-secondary p-4 transition-all duration-200 hover:brightness-110 lg:flex ${
            isBorder ? "box" : ""
          }`}
          onClick={() => setIsOpenDetailModal(true)}
        >
          <div className="flex items-start justify-between">
            <div className="grid size-12 place-content-center rounded-full bg-[#33333a]">
              {icon}
            </div>
            <Button isIconOnly className="size-8 rounded-full bg-[#33333a]">
              <IconChevronLeft />
            </Button>
          </div>

          <div className="min-w-0">
            <p className="truncate text-base">{t?.title || category?.label}</p>
            <p className="mt-1 text-[13px] text-neutral-400">{dateText}</p>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-dashed border-white/10 pt-3">
            <p className="min-w-0 truncate text-xs text-neutral-400">
              {getBankName(bank)}
            </p>
            <div className={`flex shrink-0 items-center gap-x-1 ${amountColor}`}>
              <p className="text-xl font-semibold">
                {t?.amount?.toLocaleString()}
              </p>
              <TomanIcon width="16" height="16" />
            </div>
          </div>
        </div>
      )}

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
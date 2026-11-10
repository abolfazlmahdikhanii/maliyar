import { HistoryIcon } from "@solar-icons/react/outline";
import { useRecentTransactions } from "../../hooks/useRecentTransaction";
import { getBankName } from "../../utils/bankDetector";
import { getMonthNumber } from "../../utils/formatDate";
import type { paymentMethodState } from "../transaction-form/TransactionForm";
import EmptyState from "../ui/empty-state/EmptyState";
import { Loader } from "../ui/loading-box/LoadingBox";
import TransactionItem from "../ui/transaction-item/TransactionItem";

const RecentTransactions = () => {
  const { items, loading } = useRecentTransactions(4);

  return (
    <div className="box col-span-2 rounded-[25px] max-h-130">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full text-white">
            <HistoryIcon size={23} />
          </div>
          <p className="text-white text-[21px]">تراکنش های اخیر</p>
        </div>
      </div>

      <div className="mt-6 space-y-2.75 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              compact
              kind="transactions"
              title="هنوز تراکنشی ثبت نکرده‌ای"
              description="اولین درآمد یا هزینه‌ات رو ثبت کن تا اینجا ببینی."
            />
          </div>
        ) : (
          items.map((tr) => (
            <TransactionItem
              isBorder
              transaction={{
                ...tr,
                paymentMethod: tr.paymentMethod as paymentMethodState,
              }}
              bank={tr.bank ? getBankName(tr.bank) : "حساب حذف‌شده"}
              key={`${tr._id}-${getMonthNumber(tr.date)}`}
              id={tr._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;

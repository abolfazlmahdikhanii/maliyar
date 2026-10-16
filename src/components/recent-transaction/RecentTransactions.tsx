import { HistoryIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TransactionItem from "../ui/transaction-item/TransactionItem";
import { getBankName } from "../../utils/bankDetector";

type Transactions = {
  id: string;
  name: string;
  date: string;
  account: string;
  type: "expense" | "earned";
  amount: number;
  category: string;
};

const transactionData: Transactions[] = [
  {
    id: crypto.randomUUID(),
    name: "خرید از فروشگاه",
    category: "shop",
    date: "18 آذر",
    account: "بانک سامان",
    type: "expense",
    amount: 1200000,
  },
  {
    id: crypto.randomUUID(),
    name: "خرید از فروشگاه",
    category: "shop",
    date: "18 آذر",
    account: "بانک سامان",
    type: "earned",
    amount: 1200000,
  },
  {
    id: crypto.randomUUID(),
    name: "خرید از فروشگاه",
    category: "shop",
    date: "18 آذر",
    account: "بانک سامان",
    type: "earned",
    amount: 1200000,
  },
  {
    id: crypto.randomUUID(),
    name: "خرید از فروشگاه",
    category: "shop",
    date: "18 آذر",
    account: "بانک سامان",
    type: "earned",
    amount: 1200000,
  },
  {
    id: crypto.randomUUID(),
    name: "خرید از فروشگاه",
    category: "shop",
    date: "18 آذر",
    account: "بانک سامان",
    type: "earned",
    amount: 1200000,
  },
];
const RecentTransactions = () => {
  const transactions = useQuery(api.transactions.list);

  return (
    <div className="box col-span-2 rounded-[25px] max-h-129 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full  text-white">
            <HistoryIcon size={23} />
          </div>
          <p className="text-white text-[21px]  "> تراکنش های اخیر</p>
        </div>
      </div>
      <div className="mt-6.5 space-y-2.75 ">
        {transactions?.slice(0, 4).map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            bank={
              transaction.bank
                ? getBankName(transaction.bank)
                : "حساب حذف‌شده"
            }
            id={transaction._id}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;

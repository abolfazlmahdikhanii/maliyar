import { Button } from "@heroui/react";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import CashflowChart from "../../components/cashflow-chart/CashflowChart";
import ChatModal from "../../components/chat-modal/ChatModal";
import Expense from "../../components/expense/Expense";
import GoalBox from "../../components/goal-box/GoalBox";
import Income from "../../components/income/Income";
import RecentTransactions from "../../components/recent-transaction/RecentTransactions";
import AdBanner from "../../components/ui/ad-baner/AdBanner";
import BalanceCard from "../../components/ui/balance-card/BalanceCard";
import { useMonthStats } from "../../hooks/useMonthStats";
import { getCurrentYearMonth, getMonthRange } from "../../utils/jalaliMonth";
import { sumBy } from "../../utils/state";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isOpenChat, setIsOpenChat] = useState<boolean>(false);
  const navigate=useNavigate()
  const accounts = useQuery(api.accounts.list);
  const range = useMemo(() => getMonthRange(getCurrentYearMonth()), []);
  const monthTransactions = useQuery(api.transactions.list, range);
  const stats = useMonthStats(range, monthTransactions);

  const balance = sumBy(accounts ?? [], (a) => a.balance);

  const net = stats.income - stats.outcome;
  const previousBalance = balance - net;
  const balanceChange =
    previousBalance > 0 ? Math.round((net / previousBalance) * 100) : null;
  return (
    <div className="mt-18 relative">
      <div className="grid grid-cols-3 gap-6">
        <BalanceCard
          balance={balance}
          change={balanceChange}
          loading={accounts === undefined}
        />
        <Income
          total={stats.income}
          change={stats.incomeChange}
          groups={stats.incomeGroups}
          loading={stats.loading}
        />
        <Expense
          total={stats.outcome}
          change={stats.outcomeChange}
          groups={stats.outcomeGroups}
          loading={stats.loading}
        />
        <GoalBox onOpenGoals={()=>navigate("/finance-goal")}/>
        <CashflowChart />
        <RecentTransactions />
        <AdBanner />
      </div>
      <Button
        isIconOnly
        className={
          "w-14.5 h-14.5 rounded-full fixed bottom-9 z-50 left-[77%] hover:bg-[#6BC945] bg-[#7ED957] [&>svg]:size-6 grid place-items-center"
        }
        onClick={() => setIsOpenChat(true)}
      >
        <svg width={24} height={24} viewBox="0 0 24 24">
          <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"></path>
        </svg>
      </Button>

      <ChatModal
        isOpen={isOpenChat}
        onOpenChange={() => setIsOpenChat(false)}
        onSend={async () => ""}
      />
    </div>
  );
};

export default Dashboard;

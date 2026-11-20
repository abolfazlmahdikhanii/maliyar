import { Button } from "@heroui/react";
import { useQuery } from "convex/react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const SLIDE = "keen-slider__slide px-1 pt-12 pb-3 lg:min-w-0 lg:p-0";
const SLIDES_COUNT = 3;

const Dashboard = () => {
  const [isOpenChat, setIsOpenChat] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const accounts = useQuery(api.accounts.list);
  const range = useMemo(() => getMonthRange(getCurrentYearMonth()), []);
  const monthTransactions = useQuery(api.transactions.list, range);
  const stats = useMonthStats(range, monthTransactions);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    rtl: true,
    initial: 0,
    slides: { perView: 1.1, spacing: 15, origin: "center" },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    breakpoints: {
      "(min-width: 1024px)": { disabled: true },
    },
  });

  const balance = sumBy(accounts ?? [], (a) => a.balance);

  const net = stats.income - stats.outcome;
  const previousBalance = balance - net;
  const balanceChange =
    previousBalance > 0 ? Math.round((net / previousBalance) * 100) : null;

  return (
    <div className="relative mt-4 lg:mt-18">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
    
        <div className="lg:contents col-span-2">
          <div ref={sliderRef} className="keen-slider lg:contents">
            <div className={SLIDE}>
              <BalanceCard
                balance={balance}
                change={balanceChange}
                loading={accounts === undefined}
                onOpen={() => navigate("/accounts")}
              />
            </div>
            <div className={SLIDE}>
              <Income
                total={stats.income}
                change={stats.incomeChange}
                groups={stats.incomeGroups}
                loading={stats.loading}
              />
            </div>
            <div className={SLIDE}>
              <Expense
                total={stats.outcome}
                change={stats.outcomeChange}
                groups={stats.outcomeGroups}
                loading={stats.loading}
              />
            </div>
          </div>


          <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
            {Array.from({ length: SLIDES_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`کارت ${i + 1}`}
                onClick={() => instanceRef.current?.moveToIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i ? "w-6 bg-[#A3E96B]" : "w-2 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        <GoalBox onOpenGoals={() => navigate("/finance-goal")} />
        <CashflowChart />
        <RecentTransactions />
        <AdBanner />
      </div>

      <Button
        isIconOnly
        className="fixed bottom-28 left-4 z-50 grid h-14.5 w-14.5 place-items-center rounded-full bg-[#7ED957] hover:bg-[#6BC945] lg:bottom-9 lg:left-[77%] [&>svg]:size-6"
        onClick={() => setIsOpenChat(true)}
      >
        <svg width={24} height={24} viewBox="0 0 24 24">
          <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"></path>
        </svg>
      </Button>

      <ChatModal
        isOpen={isOpenChat}
        onOpenChange={() => setIsOpenChat(false)}
      />
    </div>
  );
};

export default Dashboard;
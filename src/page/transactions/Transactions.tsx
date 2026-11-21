import { Tabs } from "@heroui/react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import TransactionForm, {
  type paymentMethodState,
} from "../../components/transaction-form/TransactionForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import MonthSummary from "../../components/ui/month-summary/MonthSummary";
import MonthYearPicker from "../../components/ui/month-year-picker/MonthYearPicker";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";
import TransactionItem from "../../components/ui/transaction-item/TransactionItem";
import { useMonthStats } from "../../hooks/useMonthStats";
import { getBankName } from "../../utils/bankDetector";
import { getMonthNumber } from "../../utils/formatDate";
import {
  getCurrentYearMonth,
  getMonthRange,
  type YearMonth,
} from "../../utils/jalaliMonth";

export type Transaction = FunctionReturnType<
  typeof api.transactions.list
>[number];

const tabs: {
  id: string;
  label: string;
  filter: (transaction: Transaction) => boolean;
}[] = [
  { id: "all", label: "همه", filter: () => true },
  { id: "income", label: "درآمد ها", filter: (t) => t.type === "income" },
  { id: "outcome", label: "هزینه ها", filter: (t) => t.type === "outcome" },
];

const Transactions = () => {
  const [yearMonth, setYearMonth] = useState<YearMonth>(getCurrentYearMonth);
  const range = useMemo(() => getMonthRange(yearMonth), [yearMonth]);

  const transaction = useQuery(api.transactions.list, range);
  const stats = useMonthStats(range, transaction);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  const current = getCurrentYearMonth();
  const isCurrentMonth =
    yearMonth.year === current.year && yearMonth.month === current.month;

  const changeMonth = (delta: number) => {
    let year = yearMonth.year;
    let month = yearMonth.month + delta;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    setYearMonth({ year, month });
  };

  return (
    <div>
      <Title
        text="تراکنش‌ها"
        btnText="تراکنش جدید"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="mt-5 lg:hidden">
        <MonthSummary
          year={yearMonth.year}
          month={yearMonth.month}
          income={stats.income}
          outcome={stats.outcome}
          loading={stats.loading}
          isCurrentMonth={isCurrentMonth}
          onChangeMonth={changeMonth}
        />
      </div>

      <div className="mt-14 mb-8 hidden grid-cols-2 gap-6 lg:grid xl:grid-cols-3 *:min-w-0">
        <TotalCard
          count={stats.count}
          change={stats.countChange}
          loading={stats.loading}
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
      </div>

      <Tabs className="mt-6 w-full lg:mt-12">
        <div className="flex items-center justify-between">
          <Tabs.ListContainer className="w-full border border-secondary bg-secondary px-2 py-2 lg:w-132.5">
            <Tabs.List aria-label="Options">
              {tabs.map((tab) => (
                <Tabs.Tab
                  key={tab.id}
                  id={tab.id}
                  className="h-10.5 data-[selected=true]:text-black"
                >
                  {tab.label}
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          <div className="hidden lg:block">
            <MonthYearPicker
              initialYear={yearMonth.year}
              initialMonth={yearMonth.month}
              onChange={({ year, month }) => setYearMonth({ year, month })}
            />
          </div>
        </div>

        {tabs.map((tab) => {
          const items = transaction?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="px-0 pt-6 lg:px-2" key={tab.id} id={tab.id}>
              {transaction === undefined ? (
                <div className="mt-12 lg:mt-18">
                  <Loader />
                </div>
              ) : transaction.length === 0 ? (
                <EmptyState
                  kind="transactions"
                  title="این ماه تراکنشی نداری"
                  description="اولین درآمد یا هزینه‌ی این ماه رو ثبت کن."
                  action={{
                    label: "تراکنش جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2   *:min-w-0 ">
                  {items.map((tr) => (
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
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="تراکنش جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت تراکنش"
        formId="transaction-modal-form"
        loading={loadingForm}
      >
        <TransactionForm
          formId="transaction-modal-form"
          onSuccess={() => setIsOpenModal(false)}
          loading={loadingForm}
          onLoadingChange={setLoadingForm}
        />
      </FormModal>
    </div>
  );
};

export default Transactions;

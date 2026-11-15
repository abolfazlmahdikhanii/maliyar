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

  return (
    <div>
      <Title
        text="تراکنش‌ها"
        btnText="تراکنش جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
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

      <Tabs className="w-full mt-12 ">
        <div className="flex items-center justify-between">
          <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-132.5">
            <Tabs.List aria-label="Options">
              {tabs.map((tab) => (
                <Tabs.Tab
                  key={tab.id}
                  id={tab.id}
                  className="h-10.5 data-[selected=true]:text-black"
                >
                  {tab.label}
                  <Tabs.Indicator className="bg-primary " />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          <MonthYearPicker
            initialYear={yearMonth.year}
            initialMonth={yearMonth.month}
            onChange={({ year, month }) => setYearMonth({ year, month })}
          />
        </div>
        {tabs.map((tab) => {
          const items = transaction?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="pt-6 px-2" key={tab.id} id={tab.id}>
              {transaction === undefined ? (
                <div className="mt-18">
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
                <div className=" space-y-2.75 ">
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

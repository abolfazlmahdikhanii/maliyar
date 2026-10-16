import { Tabs } from "@heroui/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import TransactionForm, {
  type paymentMethodState,
} from "../../components/transaction-form/TransactionForm";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";
import TransactionItem from "../../components/ui/transaction-item/TransactionItem";
import { getBankName } from "../../utils/bankDetector";
import { getMonthNumber } from "../../utils/formatDate";

const persianMonths = [
  { id: "farvardin", month: 1, label: "فروردین" },
  { id: "ordibehesht", month: 2, label: "اردیبهشت" },
  { id: "khordad", month: 3, label: "خرداد" },
  { id: "tir", month: 4, label: "تیر" },
  { id: "mordad", month: 5, label: "مرداد" },
  { id: "shahrivar", month: 6, label: "شهریور" },
  { id: "mehr", month: 7, label: "مهر" },
  { id: "aban", month: 8, label: "آبان" },
  { id: "azar", month: 9, label: "آذر" },
  { id: "dey", month: 10, label: "دی" },
  { id: "bahman", month: 11, label: "بهمن" },
  { id: "esfand", month: 12, label: "اسفند" },
];
const Transactions = () => {
  const transaction = useQuery(api.transactions.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  return (
    <div>
      <Title
        text="تراکنش‌ها"
        btnText="تراکنش جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 ">
        <TotalCard />
        <Income />
        <Expense />
      </div>
      <Tabs className="w-full mt-12 ">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary">
          <Tabs.List aria-label="Options">
            {persianMonths.map((month) => (
              <Tabs.Tab
                key={month.id}
                id={month.id}
                className="h-10.5 data-[selected=true]:text-black"
              >
                {month.label}
                <Tabs.Indicator className="bg-primary " />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {persianMonths.map((month) => (
          <Tabs.Panel className="pt-6 px-2" key={month.id} id={month.id}>
            {transaction === undefined && (
              <div className="mt-18">
                <Loader />
              </div>
            )}
            <div className=" space-y-2.75 ">
              {transaction
                ?.filter((item) => getMonthNumber(item.date) === month.month)
                ?.map((tr) => (
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
          </Tabs.Panel>
        ))}
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

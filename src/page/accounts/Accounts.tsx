import { Tabs } from "@heroui/react";
import {
  Card2Icon,
  CardReceiveIcon,
  CardSendIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import AccountsForm from "../../components/accounts-form/AccountsForm";
import CardBox from "../../components/card-box/CardBox";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";

type Account = FunctionReturnType<typeof api.accounts.list>[number];

const tabs: { id: string; label: string; filter: (a: Account) => boolean }[] = [
  { id: "all", label: "همه حساب ها", filter: () => true },
  { id: "card", label: "کارت های بانکی", filter: (a) => a.type === "card" },
  { id: "wallet", label: "کیف پول نقدی", filter: (a) => a.type === "wallet" },
];

const EMPTY = {
  card: {
    title: "کارت بانکی نداری",
    description: "یه حساب بانکی اضافه کن تا موجودی و تراکنش‌هاش رو ببینی.",
  },
  wallet: {
    title: "کیف پول نقدی نداری",
    description:
      "کیف پول نقدی برای پول دستی و خرج‌های روزمره‌ست و فقط یکی می‌شه ساخت.",
  },
};

const Accounts = () => {
  const accounts = useQuery(api.accounts.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const all = accounts ?? [];
  const balance = sumBy(all, (a) => a.balance);
  const income = sumBy(all, (a) => a.totalIncome);
  const outcome = sumBy(all, (a) => a.totalOutcome);
  const count = sumBy(all, (a) => a.transactionCount);

  return (
    <div>
      <Title
        text="مدیریت حساب"
        btnText="حساب جدید"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <StatCard
          title="موجودی کل"
          icon={Card2Icon}
          tone="blue"
          value={balance}
          delta={{ text: `${all.length} حساب`, label: "بانکی و نقدی" }}
          loading={!accounts}
        />
        <StatCard
          title="درآمد ۳۰ روز اخیر"
          icon={CardReceiveIcon}
          tone="green"
          value={income}
          delta={{ text: `${count} تراکنش`, label: "درآمد و هزینه" }}
          loading={!accounts}
        />
        <StatCard
          title="هزینه ۳۰ روز اخیر"
          icon={CardSendIcon}
          tone="red"
          value={outcome}
          delta={{
            text: `${percentOf(outcome, income)}%`,
            tone: outcome > income ? "red" : "yellow",
            label: "از درآمد",
          }}
          loading={!accounts}
        />
      </div>

      <Tabs className="w-full mt-12">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Accounts">
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

        {tabs.map((tab) => {
          const items = accounts?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="pt-6 px-2" id={tab.id} key={tab.id}>
              {accounts === undefined ? (
                <div className="mt-18">
                  <Loader />
                </div>
              ) : accounts.length === 0 ? (
                <EmptyState
                  kind="accounts"
                  title="هنوز حسابی نداری"
                  description="یه حساب بانکی یا کیف پول نقدی بساز تا تراکنش‌هات بتونن بهش وصل بشن."
                  action={{
                    label: "حساب جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  kind="accounts"
                  className="py-8"
                  {...EMPTY[tab.id as keyof typeof EMPTY]}
                />
              ) : (
                <div className="grid grid-cols-3 gap-7">
                  {items.map((account) => (
                    <CardBox
                      key={account._id}
                      balance={account.balance}
                      cardNumber={account.cardNumber}
                      totalIncome={account.totalIncome}
                      totalOutcome={account.totalOutcome}
                      transactionCount={account.transactionCount}
                      type={account.type}
                      _id={account._id}
                      iban={account.iban}
                      initialBalance={account.initialBalance}
                    />
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="حساب جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت حساب"
        formId="account-modal-form"
        loading={loadingForm}
      >
        <AccountsForm
          formId="account-modal-form"
          onSuccess={() => setIsOpenModal(false)}
          onLoadingChange={setLoadingForm}
          loading={loadingForm}
        />
      </FormModal>
    </div>
  );
};

export default Accounts;

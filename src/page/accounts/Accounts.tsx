import { Tabs } from "@heroui/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import AccountsForm from "../../components/accounts-form/AccountsForm";
import CardBox from "../../components/card-box/CardBox";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

const Accounts = () => {
  const accounts = useQuery(api.accounts.list);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState(false);

  return (
    <div>
      <Title
        text="مدیریت حساب"
        btnText="حساب جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <TotalCard />
        <Income />
        <Expense />
      </div>
      <Tabs className="w-full mt-12 ">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Options">
            <Tabs.Tab
              id="all"
              className="h-10.5 data-[selected=true]:text-black"
            >
              همه حساب ها
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="card"
              className="h-10.5 data-[selected=true]:text-black"
            >
              کارت های بانکی
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="wallet"
              className="h-10.5 data-[selected=true]:text-black"
            >
              کیف پول نقدی
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {["all", "card", "wallet"].map((tab) => (
          <Tabs.Panel key={tab} className="pt-6 px-2" id={tab}>
            {accounts === undefined && (
              <div className="mt-22">
                <Loader />
              </div>
            )}
            <div className="grid grid-cols-3 gap-7">
              {accounts
                ?.filter((item) => (tab === "all" ? item : item.type === tab))
                ?.map((account) => (
                  <CardBox
                    key={account._id}
                    balance={account.balance}
                    cardNumber={account?.cardNumber}
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
          </Tabs.Panel>
        ))}
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

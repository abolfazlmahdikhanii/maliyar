import { Tabs } from "@heroui/react";
import { useState } from "react";
import CheckBox from "../../components/check-box/CheckBox";
import CheckForm from "../../components/check-form/CheckForm";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import CardHolder from "../../components/ui/CardHolder/CardHolder";
import FormModal from "../../components/ui/form-modal/FormModal";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

const Accounts = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  return (
    <div>
      <Title
        text="مدیریت چک"
        btnText="چک جدید"
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
              id="debt"
              className="h-10.5 data-[selected=true]:text-black"
            >
              بدهی های من
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="claim"
              className="h-10.5 data-[selected=true]:text-black"
            >
              طلب های من
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="done"
              className="h-10.5 data-[selected=true]:text-black"
            >
              تسویه شده ها
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel className="pt-6 px-2" id="debt">
          <div className="grid grid-cols-3 gap-7">
            <CardHolder cardNumber="6273532563" />
          </div>
        </Tabs.Panel>
        <Tabs.Panel className="pt-6 px-2" id="claim">
          <div className="grid grid-cols-2 gap-7">
            <CheckBox />
            <CheckBox />
          </div>
        </Tabs.Panel>
        <Tabs.Panel className="pt-6 px-2" id="done">
          <div className="grid grid-cols-2 gap-7">
            <CheckBox />
            <CheckBox />
          </div>
        </Tabs.Panel>
      </Tabs>

      <FormModal
        title="چک جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت چک"
      >
        <CheckForm />
      </FormModal>
    </div>
  );
};

export default Accounts;

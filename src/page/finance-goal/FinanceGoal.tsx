import { Tabs } from "@heroui/react";
import { useState } from "react";
import Expense from "../../components/expense/Expense";
import FinanceGoalBox from "../../components/finance-goal-box/FinanceGoalBox";
import GoalForm from "../../components/goal-form/GoalForm";
import Income from "../../components/income/Income";
import FormModal from "../../components/ui/form-modal/FormModal";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

const FinanceGoal = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  return (
    <div>
      <Title
        text="مدیریت اهداف"
        btnText="هدف جدید"
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
              همه اهداف
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="claim"
              className="h-10.5 data-[selected=true]:text-black"
            >
              اهداف در حال انجام
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
            <Tabs.Tab
              id="done"
              className="h-10.5 data-[selected=true]:text-black"
            >
              اهداف انجام شده
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel className="pt-6 px-2" id="debt">
          <div className="grid grid-cols-3 gap-5">
            <FinanceGoalBox />
          </div>
        </Tabs.Panel>
        <Tabs.Panel className="pt-6 px-2" id="claim">
          <div className="grid grid-cols-2 gap-7"></div>
        </Tabs.Panel>
        <Tabs.Panel className="pt-6 px-2" id="done">
          <div className="grid grid-cols-2 gap-7"></div>
        </Tabs.Panel>
      </Tabs>

      <FormModal
        title="هدف جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت هدف"
      >
        <GoalForm />
      </FormModal>
    </div>
  );
};

export default FinanceGoal;

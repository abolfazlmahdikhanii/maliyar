import { Tabs } from "@heroui/react";
import {
  CardholderIcon,
  ConfettiIcon,
  HandMoneyIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import FinanceGoalBox from "../../components/finance-goal-box/FinanceGoalBox";
import GoalForm from "../../components/goal-form/GoalForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";
import { Loader } from "../../components/ui/loading-box/LoadingBox";

export type Goal = FunctionReturnType<typeof api.goals.list>[number];

const tabs: { id: string; label: string; filter: (goal: Goal) => boolean }[] = [
  { id: "all", label: "همه اهداف", filter: () => true },
  { id: "active", label: "اهداف در حال انجام", filter: (g) => !g.completed },
  { id: "done", label: "اهداف انجام شده", filter: (g) => g.completed },
];
const EMPTY = {
  all: { title: "هنوز هدفی نداری", description: "یه هدف جدید بساز." },
  active: {
    title: "هدف در حال انجامی نداری",
    description: "همه‌ی اهدافت تکمیل شده؛ یه هدف جدید بساز.",
  },
  done: {
    title: "هنوز هدفی تکمیل نشده",
    description: "هر هدفی که به مبلغش برسه اینجا میاد.",
  },
};
const FinanceGoal = () => {
  const goals = useQuery(api.goals.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const all = goals ?? [];
  const saved = sumBy(all, (g) => g.savedAmount);
  const target = sumBy(all, (g) => g.targetAmount);
  const done = all.filter((g) => g.completed).length;
  return (
    <div>
      <Title
        text="مدیریت اهداف"
        btnText="هدف جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <StatCard
          title="مجموع پس‌انداز"
          icon={CardholderIcon}
          tone="green"
          value={saved}
          delta={{
            text: `${percentOf(saved, target)}%`,
            trend: "up",
            label: "از کل مبلغ اهداف",
          }}
          loading={!goals}
        />
        <StatCard
          title="مبلغ کل اهداف"
          icon={HandMoneyIcon}
          tone="blue"
          value={target}
          delta={{ text: `${all.length} هدف`, label: "ثبت‌شده" }}
          loading={!goals}
        />
        <StatCard
          title="اهداف تکمیل‌شده"
          icon={ConfettiIcon}
          tone="yellow"
          value={done}
          unit="هدف"
          delta={{
            text: `${percentOf(done, all.length)}%`,
            tone: "green",
            trend: "up",
            label: `از ${all.length} هدف`,
          }}
          loading={!goals}
        />
      </div>
      <Tabs className="w-full mt-12">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Goals">
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
          const items = goals?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="pt-6 px-2" id={tab.id} key={tab.id}>
              {goals === undefined ? (
                <div className="mt-18">
                  <Loader />
                </div>
              ) : goals.length === 0 ? (
                <EmptyState
                  kind="goals"
                  title="هنوز هدفی نداری"
                  description="برای سفر، خودرو یا هر چیزی که می‌خوای یه هدف بساز و مرحله‌به‌مرحله پس‌اندازش کن."
                  action={{
                    label: "هدف جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  kind="goals"
                  className="py-8"
                  {...EMPTY[tab.id as keyof typeof EMPTY]}
                />
              ) : (
                <div className="grid grid-cols-3 gap-4.5">
                  {items.map((goal) => (
                    <FinanceGoalBox key={goal._id} goal={goal} />
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="هدف جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت هدف"
        formId="goal-form"
        loading={isLoading}
      >
        <GoalForm
          formId="goal-form"
          loading={isLoading}
          onLoadingChange={setIsLoading}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default FinanceGoal;

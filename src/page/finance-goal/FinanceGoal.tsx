import { Tabs } from "@heroui/react";
import {
  CardholderIcon,
  ConfettiIcon,
  HandMoneyIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import FinanceGoalBox from "../../components/finance-goal-box/FinanceGoalBox";
import GoalForm from "../../components/goal-form/GoalForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";

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

const SLIDE = "keen-slider__slide px-1 pb-3 lg:min-w-0 lg:p-0";
const SLIDES_COUNT = 3;

const FinanceGoal = () => {
  const goals = useQuery(api.goals.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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

      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 lg:mt-14 lg:mb-8 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="lg:contents col-span-3">
          <div ref={sliderRef} className="keen-slider lg:contents">
            <div className={SLIDE}>
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
            </div>
            <div className={SLIDE}>
              <StatCard
                title="مبلغ کل اهداف"
                icon={HandMoneyIcon}
                tone="blue"
                value={target}
                delta={{ text: `${all.length} هدف`, label: "ثبت‌شده" }}
                loading={!goals}
              />
            </div>
            <div className={SLIDE}>
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
          </div>

          <div className="flex items-center justify-center gap-2 lg:hidden">
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
      </div>

      <Tabs className="mt-6 w-full lg:mt-12">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Tabs.ListContainer className=" border border-secondary bg-secondary px-2 py-2 lg:w-137.5">
            <Tabs.List aria-label="Goals">
              {tabs.map((tab) => (
                <Tabs.Tab
                  key={tab.id}
                  id={tab.id}
                  className="h-10.5 whitespace-nowrap px-4 data-[selected=true]:text-black"
                >
                  {tab.label}
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </div>

        {tabs.map((tab) => {
          const items = goals?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="px-0 pt-6 lg:px-2" id={tab.id} key={tab.id}>
              {goals === undefined ? (
                <div className="mt-12 lg:mt-18">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-4.5 xl:grid-cols-3 *:min-w-0">
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

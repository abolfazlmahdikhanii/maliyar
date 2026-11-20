import { Tabs } from "@heroui/react";
import {
  BillListIcon,
  CalendarIcon,
  ClockCircleIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import SubscriptionBox from "../../components/subscription-box/SubscriptionBox";
import SubscriptionForm from "../../components/subscription-form/SubscriptionForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { daysUntil } from "../../utils/dateMath";
import { sumBy } from "../../utils/state";

export type Subscription = FunctionReturnType<
  typeof api.subscriptions.list
>[number];

const tabs: {
  id: string;
  label: string;
  filter: (subscription: Subscription) => boolean;
}[] = [
  { id: "all", label: "همه اشتراک ها", filter: () => true },
  {
    id: "active",
    label: "اشتراک های فعال",
    filter: (s) => s.status === "active",
  },
  {
    id: "inactive",
    label: "اشتراک ها متوقف شده",
    filter: (s) => s.status === "inactive",
  },
];

const EMPTY = {
  all: { title: "اشتراکی ثبت نشده", description: "یه اشتراک جدید اضافه کن." },
  active: {
    title: "اشتراک فعالی نداری",
    description: "اشتراک‌های متوقف رو از منوی کارتشون دوباره فعال کن.",
  },
  inactive: {
    title: "اشتراک متوقفی نداری",
    description: "اشتراکی که متوقف کنی اینجا میاد.",
  },
};

const PER_YEAR = {
  weekly: 52,
  monthly: 12,
  "three-month": 4,
  yearly: 1,
} as const;

const SLIDE = "keen-slider__slide px-1 pb-3 lg:min-w-0 lg:p-0";
const SLIDES_COUNT = 3;

const Subscriptions = () => {
  const subscriptions = useQuery(api.subscriptions.list);
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

  const all = subscriptions ?? [];
  const active = all.filter((s) => s.status === "active");
  const paused = all.length - active.length;
  const yearly = sumBy(active, (s) => s.amount * PER_YEAR[s.cycle]);
  const monthly = Math.round(yearly / 12);

  const next = active[0];
  const days = next ? daysUntil(next.nextPaymentDate) : undefined;

  return (
    <div>
      <Title
        text="مدیریت اشتراک"
        btnText="اشتراک جدید"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 lg:mt-14 lg:mb-8 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="lg:contents">
          <div ref={sliderRef} className="keen-slider lg:contents">
            <div className={SLIDE}>
              <StatCard
                title="هزینه‌ی ماهانه"
                icon={CalendarIcon}
                tone="green"
                value={monthly}
                delta={{
                  text: `${active.length} فعال`,
                  label: `از ${all.length} اشتراک`,
                }}
                loading={!subscriptions}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="هزینه‌ی سالانه"
                icon={BillListIcon}
                tone="blue"
                value={yearly}
                delta={
                  paused > 0
                    ? {
                        text: `${paused} متوقف`,
                        tone: "yellow",
                        label: "در محاسبه نیست",
                      }
                    : { text: "همه فعال", tone: "green" }
                }
                loading={!subscriptions}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="نزدیک‌ترین پرداخت"
                icon={ClockCircleIcon}
                tone="yellow"
                value={days === undefined ? undefined : Math.abs(days)}
                unit={days !== undefined && days < 0 ? "روز گذشته" : "روز دیگر"}
                delta={{
                  text: next ? next.name : "اشتراک فعالی نیست",
                  tone: days !== undefined && days < 0 ? "red" : "yellow",
                  label: next
                    ? `${next.amount.toLocaleString("en-US")} تومان`
                    : undefined,
                }}
                loading={!subscriptions}
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
          <Tabs.ListContainer className=" w-full border border-secondary bg-secondary px-2 py-2 lg:w-137.5 ">
            <Tabs.List aria-label="Options">
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
          const items = subscriptions?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="px-0 pt-6 lg:px-2" id={tab.id} key={tab.id}>
              {subscriptions === undefined ? (
                <div className="mt-12 lg:mt-18">
                  <Loader />
                </div>
              ) : subscriptions.length === 0 ? (
                <EmptyState
                  kind="subscriptions"
                  title="اشتراکی ثبت نشده"
                  description="پرداخت‌های تکراری مثل نتفلیکس و اسپاتیفای رو اضافه کن تا تاریخ پرداخت بعدی یادت بمونه."
                  action={{
                    label: "اشتراک جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  kind="subscriptions"
                  className="py-8"
                  {...EMPTY[tab.id as keyof typeof EMPTY]}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 xl:grid-cols-3 *:min-w-0">
                  {items.map((subscription) => (
                    <SubscriptionBox
                      key={subscription._id}
                      subscription={subscription}
                    />
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="اشتراک جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت اشتراک"
        formId="subscription-form"
        loading={isLoading}
      >
        <SubscriptionForm
          formId="subscription-form"
          onSuccess={() => setIsOpenModal(false)}
          loading={isLoading}
          onLoadingChange={setIsLoading}
        />
      </FormModal>
    </div>
  );
};

export default Subscriptions;
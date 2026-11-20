import { Tabs } from "@heroui/react";
import {
  ArrowLeftDownIcon,
  ArrowRightUpIcon,
  CloseCircleIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import CheckBox from "../../components/check-box/CheckBox";
import CheckForm from "../../components/check-form/CheckForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";

type Check = FunctionReturnType<typeof api.checks.list>[number];

const tabs: { id: string; label: string; filter: (check: Check) => boolean }[] =
  [
    { id: "all", label: "همه", filter: () => true },
    {
      id: "received",
      label: "دریافتی‌ها",
      filter: (c) => c.direction === "received" && c.status === "pending",
    },
    {
      id: "issued",
      label: "پرداختی‌ها",
      filter: (c) => c.direction === "issued" && c.status === "pending",
    },
    {
      id: "done",
      label: "نهایی‌شده‌ها",
      filter: (c) => c.status !== "pending",
    },
  ];

const EMPTY = {
  received: {
    title: "دریافتی در انتظاری نداری",
    description: "همه‌ی چک‌های دریافتی نهایی شدن.",
  },
  issued: {
    title: "پرداختی در انتظاری نداری",
    description: "چک پرداخت‌نشده‌ای باقی نمونده.",
  },
  done: {
    title: "هنوز چکی نهایی نشده",
    description: "چک‌های وصول‌شده، پرداخت‌شده و برگشتی اینجا میان.",
  },
};

const total = (items: Check[]) => items.reduce((s, c) => s + c.amount, 0);
const clearedTotal = (items: Check[]) =>
  total(items.filter((c) => c.status === "cleared"));

const percent = (part: number, whole: number) =>
  whole ? Math.floor((part / whole) * 100) : 0;

const SLIDE = "keen-slider__slide px-1 pb-3 lg:min-w-0 lg:p-0";
const SLIDES_COUNT = 3;

const Checks = () => {
  const checks = useQuery(api.checks.list, {});
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

  const all = checks ?? [];
  const received = all.filter((c) => c.direction === "received");
  const issued = all.filter((c) => c.direction === "issued");
  const bounced = all.filter((c) => c.status === "bounced");

  return (
    <div>
      <Title
        text="مدیریت چک"
        btnText="چک جدید"
        onOpen={() => setIsOpenModal(true)}
      />

      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 lg:mt-14 lg:mb-8 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="lg:contents col-span-full">
          <div ref={sliderRef} className="keen-slider lg:contents">
            <div className={SLIDE}>
              <StatCard
                title="چک‌های دریافتی"
                icon={ArrowLeftDownIcon}
                tone="green"
                value={total(received)}
                delta={{
                  text: `${percent(clearedTotal(received), total(received))}%`,
                  trend: "up",
                  label: `وصول شده از ${received.length} چک`,
                }}
                loading={!checks}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="چک‌های پرداختی"
                icon={ArrowRightUpIcon}
                tone="red"
                value={total(issued)}
                delta={{
                  text: `${percent(clearedTotal(issued), total(issued))}%`,
                  trend: "up",
                  label: `پرداخت شده از ${issued.length} چک`,
                }}
                loading={!checks}
              />
            </div>
            <div className={SLIDE}>
              <StatCard
                title="چک‌های برگشتی"
                icon={CloseCircleIcon}
                tone="yellow"
                value={bounced.length}
                unit="چک"
                delta={{
                  text: `${percent(bounced.length, all.length)}%`,
                  tone: bounced.length > 0 ? "red" : "green",
                  label: `از ${all.length} چک ثبت‌شده`,
                }}
                loading={!checks}
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
            <Tabs.List aria-label="Checks">
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
          const items = checks?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="px-0 pt-6 lg:px-2" id={tab.id} key={tab.id}>
              {checks === undefined ? (
                <div className="mt-12 lg:mt-18">
                  <Loader />
                </div>
              ) : checks.length === 0 ? (
                <EmptyState
                  kind="checks"
                  title="هنوز چکی ثبت نکرده‌ای"
                  description="چک‌های دریافتی و پرداختی‌ات رو ثبت کن تا سررسیدها از دستت نره."
                  action={{
                    label: "چک جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  kind="checks"
                  className="py-8"
                  {...EMPTY[tab.id as keyof typeof EMPTY]}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 *:min-w-0">
                  {items.map((check) => (
                    <CheckBox key={check._id} check={check} />
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="چک جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت چک"
        loading={isLoading}
        formId="check-form"
      >
        <CheckForm
          formId="check-form"
          loading={isLoading}
          onLoadingChange={setIsLoading}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default Checks;
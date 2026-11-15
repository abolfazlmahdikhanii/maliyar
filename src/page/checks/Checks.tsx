import { Tabs } from "@heroui/react";
import {
  ArrowLeftDownIcon,
  ArrowRightUpIcon,
  CloseCircleIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
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

const Checks = () => {
  const checks = useQuery(api.checks.list, {});
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
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

      <Tabs className="w-full mt-12">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Checks">
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
          const items = checks?.filter(tab.filter) ?? [];
          return (
            <Tabs.Panel className="pt-6 px-2" id={tab.id} key={tab.id}>
              {checks === undefined ? (
                <div className="mt-18">
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
                <div className="grid grid-cols-2 gap-7">
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

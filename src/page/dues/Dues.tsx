import { Tabs } from "@heroui/react";
import {
  CardReceiveIcon,
  CardSendIcon,
  CardTransferIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import DuesBox from "../../components/dues-box/DuesBox";
import DuesForm from "../../components/dues-form/DuesForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";

export type Dues = FunctionReturnType<typeof api.dues.list>[number];
type Filter = "all" | "debt" | "claim" | "paid";

const tabs: { id: Filter; label: string; filter: (due: Dues) => boolean }[] = [
  { id: "all", label: "همه", filter: () => true },
  { id: "debt", label: "بدهی های من", filter: (d) => d.type === "debt" },
  { id: "claim", label: "طلب های من", filter: (d) => d.type === "claim" },
  { id: "paid", label: "تسویه شده ها", filter: (d) => d.status === "paid" },
];
const EMPTY = {
  debt: { title: "بدهی بازی نداری", description: "همه‌ی بدهی‌هات تسویه شده." },
  claim: { title: "طلب بازی نداری", description: "همه‌ی طلب‌هات دریافت شده." },
  paid: {
    title: "موردی تسویه نشده",
    description: "بدهی‌ها و طلب‌های تسویه‌شده اینجا میان.",
  },
};
const Dues = () => {
  const dues = useQuery(api.dues.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const all = dues ?? [];
  const debts = all.filter((d) => d.type === "debt");
  const claims = all.filter((d) => d.type === "claim");
  const total = (items: typeof all) => sumBy(items, (d) => d.amount);
  const settled = (items: typeof all) =>
    total(items.filter((d) => d.status === "paid"));
  const net = total(claims) - total(debts);

  return (
    <div>
      <Title
        text="بدهی و طلب"
        btnText="عملیات جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <StatCard
          title="کل بدهی‌ها"
          icon={CardSendIcon}
          tone="red"
          value={total(debts)}
          delta={{
            text: `${percentOf(settled(debts), total(debts))}%`,
            tone: "green",
            trend: "up",
            label: `پرداخت‌شده از ${debts.length} مورد`,
          }}
          loading={!dues}
        />
        <StatCard
          title="کل طلب‌ها"
          icon={CardReceiveIcon}
          tone="green"
          value={total(claims)}
          delta={{
            text: `${percentOf(settled(claims), total(claims))}%`,
            trend: "up",
            label: `دریافت‌شده از ${claims.length} مورد`,
          }}
          loading={!dues}
        />
        <StatCard
          title="تراز کل"
          icon={CardTransferIcon}
          tone="blue"
          value={Math.abs(net)}
          delta={{
            text: net >= 0 ? "مازاد" : "کسری",
            tone: net >= 0 ? "green" : "red",
            trend: net >= 0 ? "up" : "down",
            label: "طلب منهای بدهی",
          }}
          loading={!dues}
        />
      </div>
      <Tabs className="w-full mt-12 ">
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Options">
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.id}
                id={tab.id}
                className="h-10.5 data-[selected=true]:text-black"
              >
                {tab.label}
                <Tabs.Indicator className="bg-primary " />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {tabs.map((tab) => {
          const items = dues?.filter(tab.filter);
          return (
            <Tabs.Panel className="pt-6 px-2" id={tab.id} key={tab.id}>
              {dues === undefined ? (
                <div className="mt-18">
                  <Loader />
                </div>
              ) : dues.length === 0 ? (
                <EmptyState
                  kind="dues"
                  title="بدهی یا طلبی نداری"
                  description="هر کسی بهت بدهکاره یا تو بهش بدهکاری رو ثبت کن تا سررسیدش یادت بمونه."
                  action={{
                    label: "ثبت مورد جدید",
                    onPress: () => setIsOpenModal(true),
                  }}
                />
              ) : items?.length === 0 ? (
                <EmptyState
                  kind="dues"
                  className="py-8"
                  {...EMPTY[tab.id as keyof typeof EMPTY]}
                />
              ) : (
                <div className="grid grid-cols-2 gap-5 ">
                  {items?.map((due) => (
                    <DuesBox key={due._id} dues={due} />
                  ))}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <FormModal
        title="عملیات جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت عملیات"
        loading={formLoading}
        formId="dues-form"
      >
        <DuesForm
          formId="dues-form"
          onLoadingChange={setFormLoading}
          loading={formLoading}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default Dues;

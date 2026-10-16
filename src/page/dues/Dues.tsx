import { Tabs } from "@heroui/react";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import DuesBox from "../../components/dues-box/DuesBox";
import DuesForm from "../../components/dues-form/DuesForm";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

type Filter = "all" | "debt" | "claim" | "paid";

const Dues = () => {
  const dues = useQuery(api.dues.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<Filter>("all");

  const visibleDues = useMemo(() => {
    if (filter === "all") return dues;
    if (filter === "paid") return dues?.filter((due) => due.status === "paid");
    return dues?.filter((item) => item.type === filter);
  }, [dues, filter]);
  return (
    <div>
      <Title
        text="بدهی و طلب"
        btnText="عملیات جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <TotalCard />
        <Income />
        <Expense />
      </div>
      <Tabs
        className="w-full mt-12 "
        onSelectionChange={(key) => setFilter(key as Filter)}
      >
        <Tabs.ListContainer className="py-2 px-2 bg-secondary border border-secondary w-137.5">
          <Tabs.List aria-label="Options">
            <Tabs.Tab
              id="all"
              className="h-10.5 data-[selected=true]:text-black"
            >
              همه
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
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
              id="paid"
              className="h-10.5 data-[selected=true]:text-black"
            >
              تسویه شده ها
              <Tabs.Indicator className="bg-primary " />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        {dues === undefined && (
          <div className="mt-8">
            <Loader />
          </div>
        )}
        {["all", "debt", "claim", "paid"].map((item) => (
          <Tabs.Panel className="pt-6 px-2" id={item} key={item}>
            <div className="grid grid-cols-2 gap-5 ">
              {visibleDues?.map((due) => (
                <DuesBox key={due._id} dues={due} />
              ))}
            </div>
          </Tabs.Panel>
        ))}
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

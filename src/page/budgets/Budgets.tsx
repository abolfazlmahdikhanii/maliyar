import { useMemo, useState } from "react";
import BudgetForm from "../../components/budget-form/BudgetForm";

import {
  BillListIcon,
  Card2Icon,
  CardSendIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import BudgetBox from "../../components/budget-box/BudgetBox";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { getCurrentMonthRange } from "../../utils/currentMonthRange";
import { percentOf, sumBy } from "../../utils/state";

const Budgets = () => {
  const range = useMemo(() => getCurrentMonthRange(), []);
  const budgets = useQuery(api.budgets.list, range);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const all = budgets ?? [];
  const limit = sumBy(all, (b) => b.limit);
  const spent = sumBy(all, (b) => b.used);
  const over = all.filter((b) => b.used > b.limit).length;
  const left = limit - spent;
  return (
    <>
      <Title
        text="بودجه بندی"
        btnText="افزودن بودجه"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <StatCard
          title="مجموع سقف بودجه"
          icon={BillListIcon}
          tone="blue"
          value={limit}
          delta={{ text: `${all.length} دسته`, label: "بودجه‌بندی‌شده" }}
          loading={!budgets}
        />
        <StatCard
          title="هزینه‌شده"
          icon={CardSendIcon}
          tone="yellow"
          value={spent}
          delta={{
            text: `${percentOf(spent, limit)}%`,
            tone: spent > limit ? "red" : "yellow",
            label: "از سقف",
          }}
          loading={!budgets}
        />
        <StatCard
          title={left >= 0 ? "باقی‌مانده" : "بیش از سقف"}
          icon={Card2Icon}
          tone={left >= 0 ? "green" : "red"}
          value={Math.abs(left)}
          delta={{
            text: over > 0 ? `${over} دسته فراتر از سقف` : "همه داخل سقف",
            tone: over > 0 ? "red" : "green",
          }}
          loading={!budgets}
        />
      </div>
      {budgets === undefined ? (
        <div className="mt-42">
          <Loader />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          kind="budgets"
          title="بودجه‌ای تعیین نکرده‌ای"
          description="برای هر دسته یه سقف ماهانه بذار تا خرجت از کنترل خارج نشه."
          action={{ label: "بودجه جدید", onPress: () => setIsOpenModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-3 gap-5 mt-12">
          {budgets?.map((budget) => (
            <BudgetBox key={budget._id} {...budget} />
          ))}
        </div>
      )}

      <FormModal
        title="بودجه جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت بودجه"
        formId="budget-form"
        loading={loadingForm}
      >
        <BudgetForm
          formId="budget-form"
          loading={loadingForm}
          onLoadingChange={setLoadingForm}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </>
  );
};

export default Budgets;

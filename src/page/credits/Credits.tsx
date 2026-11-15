import {
  BillListIcon,
  CardSendIcon,
  HandMoneyIcon,
} from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import CreditsBox from "../../components/credits-box/CreditsBox";
import CreditsForm from "../../components/credits-form/CreditsForm";
import EmptyState from "../../components/ui/empty-state/EmptyState";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import StatCard from "../../components/ui/state-card/StateCard";
import Title from "../../components/ui/title/Title";
import { percentOf, sumBy } from "../../utils/state";

const Credits = () => {
  const credits = useQuery(api.loans.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const all = credits ?? [];
  const total = sumBy(all, (l) => l.totalAmount);
  const paid = sumBy(all, (l) => l.paidAmount);
  const remaining = sumBy(all, (l) => l.remainingDebt);
  const remainingCount = sumBy(all, (l) => l.remainingCount);
  return (
    <div>
      <Title
        text="مدیریت وام"
        btnText="وام جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <StatCard
          title="مجموع وام‌ها"
          icon={HandMoneyIcon}
          tone="blue"
          value={total}
          delta={{ text: `${all.length} وام`, label: "ثبت‌شده" }}
          loading={!credits}
        />
        <StatCard
          title="پرداخت‌شده"
          icon={CardSendIcon}
          tone="green"
          value={paid}
          delta={{
            text: `${percentOf(paid, total)}%`,
            trend: "up",
            label: "از کل بازپرداخت",
          }}
          loading={!credits}
        />
        <StatCard
          title="مانده بدهی"
          icon={BillListIcon}
          tone="red"
          value={remaining}
          delta={{
            text: `${remainingCount} قسط`,
            tone: "yellow",
            label: "باقی‌مانده",
          }}
          loading={!credits}
        />
      </div>

      {credits === undefined ? (
        <div className="mt-18">
          <Loader />
        </div>
      ) : credits.length === 0 ? (
        <EmptyState
          kind="loans"
          title="وامی ثبت نشده"
          description="وام و اقساطش رو اضافه کن تا مانده بدهی و سررسید بعدی رو ببینی."
          action={{ label: "وام جدید", onPress: () => setIsOpenModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-7">
          {credits.map((credit) => (
            <CreditsBox key={credit._id} creditInfo={credit} />
          ))}
        </div>
      )}

      <FormModal
        title="وام جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت وام"
        loading={isLoading}
        formId="credit-form"
      >
        <CreditsForm
          formId="credit-form"
          loading={isLoading}
          onLoadingChange={setIsLoading}
          onSuccess={() => setIsOpenModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default Credits;

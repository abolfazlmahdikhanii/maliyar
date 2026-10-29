import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import CreditsBox from "../../components/credits-box/CreditsBox";
import CreditsForm from "../../components/credits-form/CreditsForm";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import FormModal from "../../components/ui/form-modal/FormModal";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

const Credits = () => {
  const credits = useQuery(api.loans.list);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <Title
        text="مدیریت وام"
        btnText="وام جدید"
        onOpen={() => setIsOpenModal(true)}
      />
      <div className="grid grid-cols-3 gap-6 mt-14 mb-8">
        <TotalCard />
        <Income />
        <Expense />
      </div>
      <div className="grid grid-cols-2 gap-7">
        {credits?.map((credit) => (
          <CreditsBox key={credit._id} creditInfo={credit} />
        ))}
      </div>

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

import { useState } from "react";
import CreditsBox from "../../components/credits-box/CreditsBox";
import CreditsForm from "../../components/credits-form/CreditsForm";
import Expense from "../../components/expense/Expense";
import Income from "../../components/income/Income";
import FormModal from "../../components/ui/form-modal/FormModal";
import Title from "../../components/ui/title/Title";
import TotalCard from "../../components/ui/total-card/TotalCard";

const Credits = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
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
        <CreditsBox />
        <CreditsBox />
      </div>

      <FormModal
        title="وام جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت وام"
      >
        <CreditsForm />
      </FormModal>
    </div>
  );
};

export default Credits;

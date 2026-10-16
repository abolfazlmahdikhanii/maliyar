import { useMemo, useState } from "react";
import BudgetForm from "../../components/budget-form/BudgetForm";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import BudgetBox from "../../components/budget-box/BudgetBox";
import FormModal from "../../components/ui/form-modal/FormModal";
import { Loader } from "../../components/ui/loading-box/LoadingBox";
import Title from "../../components/ui/title/Title";
import { getCurrentMonthRange } from "../../utils/currentMonthRange";

const Budgets = () => {
  const range = useMemo(() => getCurrentMonthRange(), []);
  const budgets = useQuery(api.budgets.list, range);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  return (
    <>
      <Title
        text="بودجه بندی"
        btnText="افزودن بودجه"
        onOpen={() => setIsOpenModal(true)}
      />
      {budgets === undefined && (
        <div className="mt-42">
          <Loader />
        </div>
      )}
      <div className="grid grid-cols-3 gap-5 mt-12">
        {budgets?.map((budget) => (
          <BudgetBox key={budget._id} {...budget} />
        ))}
      </div>
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

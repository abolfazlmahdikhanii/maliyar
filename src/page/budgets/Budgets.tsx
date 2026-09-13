import { BillIcon, BillListIcon, BusIcon, Cart4Icon, DonutBittenIcon, GamepadMinimalisticIcon, HeartPulseIcon, LaptopIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import BudgetBox from "../../components/budget-box/BudgetBox";
import BudgetForm from "../../components/budget-form/BudgetForm";

import FormModal from "../../components/ui/form-modal/FormModal";
import Title from "../../components/ui/title/Title";
import type { Category } from "../../components/ui/categories/Categories";

const categories: Category[] = [
  {
    id: crypto.randomUUID(),
    label: " سلامت",
    value: "health",
    bg: "rgba(79, 221, 209, 0.1)",
    color: "rgb(79, 221, 209)",
    icon: HeartPulseIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "خوراک",
    value: "food",
    bg: "rgba(167, 90, 235, 0.1)",
    color: "rgb(167, 90, 235)",
    icon: DonutBittenIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "خرید روزانه",
    value: "daily-buy",
    bg: "rgba(245, 208, 110,.1)",
    color: "rgb(245, 208, 110)",
    icon: Cart4Icon,
  },
  {
    id: crypto.randomUUID(),
    label: "حمل و نقل",
    value: "transport",
    bg: "rgba(73, 154, 240, 0.1)",
    color: "rgb(73, 154, 240)",
    icon: BusIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "شارژ و قبض",
    value: "charge",
    bg: "rgba(240, 96, 96, 0.1)",
    color: "rgb(240, 96, 96)",
    icon: BillListIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "سرگرمی",
    value: "entertainment",
    bg: "rgba(251, 146, 60, 0.1)",
    color: "rgb(251, 146, 60)",
    icon: GamepadMinimalisticIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "حقوق",
    value: "pay",
    bg: "rgba(110, 168, 254, 0.1)",
    color: "rgb(110, 168, 254)",

    icon: BillIcon,
  },
  {
    id: crypto.randomUUID(),
    label: "فریلنسری",
    value: "freelancer",
    bg: "rgba(94, 232, 126, 0.1)",
    color: "rgb(94, 232, 126)",
    icon: LaptopIcon,
  },
];
const Budgets = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  return (
    <>
      <Title text="بودجه بندی" btnText="افزودن بودجه"  onOpen={() => setIsOpenModal(true)} />
      <div className="grid grid-cols-3 gap-5 mt-12">
      {
        categories.map(item=>(
              <BudgetBox key={item.id} category={item} limitPrice={3_800_000} usedPrice={2_500_000} />
        ))
      }
      

      </div>
     <FormModal
        title="بودجه جدید"
        isOpen={isOpenModal}
        onOpenChange={() => setIsOpenModal(false)}
        btnText="ثبت بودجه"
      >
        <BudgetForm/>
      </FormModal>
    </>
  );
};

export default Budgets;

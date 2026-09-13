import { Label } from "@heroui/react";
import type { Icon } from "@solar-icons/react/lib/types";
import { BillIcon, BillListIcon, BusIcon, Cart4Icon, DonutBittenIcon, GamepadMinimalisticIcon, HeartPulseIcon, LaptopIcon } from "@solar-icons/react/outline";



export type Category = {
  id: string;
  bg: string;
  color: string;
  icon: Icon;
  label: string;
  value: string;
};

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

type CategoriesProps={
categoryId:string|null
setCategoryId:(data:string)=>void

}

const Categories = ({categoryId,setCategoryId}:CategoriesProps) => {
  return (
    <section className="flex flex-col gap-2  max-w-2xl mt-5.5">
      <Label htmlFor="title" className="text-muted text-sm">
        دسته بندی{" "}
      </Label>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col items-center gap-3 py-2.5 px-3 transition-all duration-200  border  rounded-xl cursor-pointer ${
              categoryId !== category.id
                ? "bg-secondary border-secondary"
                : ""
            }`}
            onClick={() => setCategoryId(category.id)}
            style={
              categoryId === category.id
                ? {
                    backgroundColor: category.bg,
                    borderColor: category.color,
                  }
                : undefined
            }
          >
            <div
              className={`w-11 h-11 min-w-11 min-h-11 grid rounded-full place-content-center `}
              style={{ background: category.bg, color: category.color }}
            >
              <category.icon size={21} />
            </div>
            <p
              className={`${
                category.id === categoryId
                  ? "text-white"
                  : "text-muted"
              } text-sm whitespace-nowrap`}
            >
              {category.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;

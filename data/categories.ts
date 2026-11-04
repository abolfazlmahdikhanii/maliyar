import type { Icon } from "@solar-icons/react/lib/types";
import {
  BillCheckIcon,
  BillCrossIcon,
  BillIcon,
  BillListIcon,
  BusIcon,
  CardholderIcon,
  CardReceiveIcon,
  CardSendIcon,
  Cart4Icon,
  DonutBittenIcon,
  GamepadMinimalisticIcon,
  HandMoneyIcon,
  HeartPulseIcon,
  LaptopIcon,
  RepeatIcon,
} from "@solar-icons/react/outline";

export type Category = {
  id: string;
  bg: string;
  color: string;
  icon: Icon;
  label: string;
  value: string;
};

export const CATEGORIES = [
  {
    id: "health",
    label: "سلامت",
    value: "health",
    bg: "rgba(79, 221, 209, 0.1)",
    color: "rgb(79, 221, 209)",
    icon: HeartPulseIcon,
  },
  {
    id: "food",
    label: "خوراک",
    value: "food",
    bg: "rgba(167, 90, 235, 0.1)",
    color: "rgb(167, 90, 235)",
    icon: DonutBittenIcon,
  },
  {
    id: "daily-buy",
    label: "خرید روزانه",
    value: "daily-buy",
    bg: "rgba(245, 208, 110,.1)",
    color: "rgb(245, 208, 110)",
    icon: Cart4Icon,
  },
  {
    id: "transport",
    label: "حمل و نقل",
    value: "transport",
    bg: "rgba(73, 154, 240, 0.1)",
    color: "rgb(73, 154, 240)",
    icon: BusIcon,
  },
  {
    id: "charge",
    label: "شارژ و قبض",
    value: "charge",
    bg: "rgba(240, 96, 96, 0.1)",
    color: "rgb(240, 96, 96)",
    icon: BillListIcon,
  },
  {
    id: "entertainment",
    label: "سرگرمی",
    value: "entertainment",
    bg: "rgba(251, 146, 60, 0.1)",
    color: "rgb(251, 146, 60)",
    icon: GamepadMinimalisticIcon,
  },
  {
    id: "pay",
    label: "حقوق",
    value: "pay",
    bg: "rgba(110, 168, 254, 0.1)",
    color: "rgb(110, 168, 254)",

    icon: BillIcon,
  },
  {
    id: "freelancer",
    label: "فریلنسری",
    value: "freelancer",
    bg: "rgba(94, 232, 126, 0.1)",
    color: "rgb(94, 232, 126)",
    icon: LaptopIcon,
  },
  {
    id: "debt",
    label: "پرداخت بدهی",
    value: "debt",
    bg: "#f060601a",
    color: "#f06060",
    icon: CardSendIcon,
  },
  {
    id: "claim",
    label: "دریافت طلب",
    value: "claim",
    bg: "rgba(94, 232, 126, 0.1)",
    color: "rgb(94, 232, 126)",
    icon: CardReceiveIcon,
  },
  {
    id: "loan",
    label: "پرداخت وام",
    value: "loan",
    bg: "rgba(139, 92, 246, 0.1)",
    color: "rgb(139, 92, 246)",
    icon: HandMoneyIcon,
  },
  {
    id: "check-income",
    label: "وصول چک",
    value: "check-income",
    bg: "rgba(94, 232, 126, 0.1)",
    color: "rgb(94, 232, 126)",
    icon: BillCheckIcon,
  },
  {
    id: "check-outcome",
    label: "پرداخت چک",
    value: "check-outcome",
    bg: "#f060601a",
    color: "#f06060",
    icon: BillCrossIcon,
  },
  {
    id: "subscription",
    label: "اشتراک",
    value: "subscription",
    bg: "rgba(236, 72, 153, 0.1)",
    color: "rgb(236, 72, 153)",
    icon: RepeatIcon,
  },
  {
    id: "goal",
    label: "واریز پس‌انداز",
    value: "goal",
    bg: "rgba(94, 232, 126, 0.1)",
    color: "rgb(94, 232, 126)",
    icon: CardholderIcon,
  },
] as const satisfies readonly Category[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const getCategory = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);

import { Button } from "@heroui/react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import { getCategory } from "../../../../data/categories";
import { getGoalCategory } from "../../../../data/goalCategories";
import { getSubscriptionCategory } from "../../../../data/subscriptionCategories";
import { getBankName } from "../../../utils/bankDetector";
import { formatDate } from "../../../utils/formatDate";

export type Draft = FunctionReturnType<typeof api.ai.chat>["drafts"][number];
export type DraftStatus = "pending" | "saving" | "saved" | "rejected";

const TITLES: Record<string, string> = {
  transaction: "تراکنش",
  check: "چک",
  loan: "وام",
  goal: "هدف مالی",
  subscription: "اشتراک",
};

const LABELS: Record<string, string> = {
  type: "نوع",
  direction: "نوع",
  amount: "مبلغ",
  categoryId: "دسته",
  accountId: "حساب",
  date: "تاریخ",
  title: "عنوان",
  note: "یادداشت",
  bank: "بانک",
  party: "طرف حساب",
  serial: "سریال",
  issueDate: "صدور",
  dueDate: "سررسید",
  interestRate: "نرخ بهره",
  receivedDate: "دریافت وام",
  firstDueDate: "اولین قسط",
  installmentAmount: "قسط ماهانه",
  installmentCount: "تعداد اقساط",
  targetAmount: "مبلغ هدف",
  savedAmount: "پس‌انداز فعلی",
  deadline: "مهلت",
  name: "نام",
  cycle: "دوره",
  nextPaymentDate: "پرداخت بعدی",
};

const WORDS: Record<string, string> = {
  income: "درآمد",
  outcome: "هزینه",
  received: "دریافتی",
  issued: "پرداختی",
  weekly: "هفتگی",
  monthly: "ماهانه",
  "three-month": "سه ماهه",
  yearly: "سالانه",
};

const MONEY = ["amount", "installmentAmount", "targetAmount", "savedAmount"];
const HIDDEN = ["paymentMethod", "status"];

type DraftCardProps = {
  draft: Draft;
  status: DraftStatus;
  onConfirm: () => void;
  onReject: () => void;
};

const DraftCard = ({ draft, status, onConfirm, onReject }: DraftCardProps) => {
  const accounts = useQuery(api.accounts.list);

  const show = (key: string, value: unknown) => {
    const text = String(value);

    if (MONEY.includes(key))
      return `${Number(value).toLocaleString("en-US")} تومان`;
    if (/date|deadline/i.test(key)) return formatDate(text) ?? text;
    if (key === "bank") return getBankName(text);
    if (key === "interestRate") return `${text}%`;

    if (key === "accountId") {
      const account = accounts?.find((a) => a._id === value);
      if (!account) return "—";
      return (
        getBankName(account.bank) +
        (account.cardNumber ? ` · ${account.cardNumber.slice(-4)}` : "")
      );
    }

    if (key === "categoryId") {
      if (draft.kind === "goal") return getGoalCategory(text).label;
      if (draft.kind === "subscription")
        return getSubscriptionCategory(text).label;
      return getCategory(text)?.label.trim() ?? text;
    }

    return WORDS[text] ?? text;
  };

  const rows = Object.entries(draft.payload).filter(
    ([key]) => !HIDDEN.includes(key),
  );
  const finished = status === "saved" || status === "rejected";

  return (
    <div
      className={`mt-2 rounded-xl border border-secondary bg-[#202025] p-4 ${
        status === "rejected" ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-white">{TITLES[draft.kind]}</p>
        {status === "saved" && (
          <span className="text-xs text-primary">ثبت شد</span>
        )}
        {status === "rejected" && (
          <span className="text-xs text-neutral-400">رد شد</span>
        )}
      </div>

      <div className="mt-3 divide-y divide-dashed divide-secondary">
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-2 text-sm"
          >
            <span className="text-neutral-400">{LABELS[key] ?? key}</span>
            <span className="text-left text-neutral-100">
              {show(key, value)}
            </span>
          </div>
        ))}
      </div>

      {!finished && (
        <div className="mt-3 flex items-center gap-x-2.5">
          <Button
            className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-black"
            isDisabled={status === "saving"}
            onPress={onConfirm}
          >
            تأیید و ثبت
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-secondary px-5 text-sm"
            isDisabled={status === "saving"}
            onPress={onReject}
          >
            رد کردن
          </Button>
        </div>
      )}
    </div>
  );
};

export default DraftCard;

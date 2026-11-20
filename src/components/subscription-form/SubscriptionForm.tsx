import {
  Form,
  Input,
  Label,
  toast,
  type DateValue,
  type Key,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { SUBSCRIPTION_CATEGORIES } from "../../../data/subscriptionCategories";
import { getBankName } from "../../utils/bankDetector";
import { formatNumber } from "../../utils/formatNumber";
import { subscriptionSchema } from "../../validators/subscriptions";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import type { TabForm } from "../dues-form/DuesForm";
import FormSelect from "../ui/form-select/FormSelect";
import FormTab from "../ui/form-tab/FormTab";

type subscriptionTypeState = "active" | "inactive";
export type subscriptionTimeCycleState =
  "weekly" | "monthly" | "three-month" | "yearly";

const tabs: TabForm<subscriptionTypeState>[] = [
  {
    id: 1,
    title: "فعال",
    value: "active",
    selectedColor: "bg-primary/15 text-primary",
  },
  {
    id: 2,
    title: "متوقف",
    value: "inactive",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
];
const CYCLES: { value: subscriptionTimeCycleState; label: string }[] = [
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
  { value: "three-month", label: "سه ماهه" },
  { value: "yearly", label: "سالانه" },
];

type SubscriptionFormProps = {
  detail?: Doc<"subscriptions">;
} & FormProps;

const SubscriptionForm = ({
  loading,
  onLoadingChange,
  onSuccess,
  formId,
  detail,
}: SubscriptionFormProps) => {
  const accounts = useQuery(api.accounts.list);
  const add = useMutation(api.subscriptions.add);
  const update = useMutation(api.subscriptions.update);
  const [titleSubscription, setTitleSubscription] = useState<string>(
    detail ? detail.name : "",
  );
  const [subscriptionType, setSubscriptionType] =
    useState<subscriptionTypeState>(detail ? detail.status : "active");
  const [subscriptionTimeCycle, setSubscriptionTimeCycle] =
    useState<subscriptionTimeCycleState>(detail ? detail.cycle : "monthly");
  const [categoryID, setCategoryID] = useState<Key | null>(
    detail ? detail.categoryId : null,
  );
  const [priceSubscription, setPriceSubscription] = useState<string>(
    detail ? detail.amount.toString() : "0",
  );
  const [nextPaymentDate, setNextPaymentDate] = useState<DateValue | null>(
    detail ? parseDate(detail.nextPaymentDate) : null,
  );
  const [accountID, setAccountID] = useState<Key | null>(
    detail?.accountId ?? null,
  );
  const accountOptions = (accounts ?? [])
    .filter((a) => a.type === "card")
    .map((a) => ({ id: a._id, label: getBankName(a.bank) }));

  const categoryOptions = (SUBSCRIPTION_CATEGORIES ?? []).map((c) => ({
    id: c.id,
    label: c.label,
  }));
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = subscriptionSchema.safeParse({
      name: titleSubscription,
      categoryId: categoryID,
      amount: priceSubscription,
      cycle: subscriptionTimeCycle,
      nextPaymentDate,
      accountId: accountID ? (accountID as Id<"accounts">) : undefined,
      status: subscriptionType,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    onLoadingChange(true);
    try {
      if (detail) {
        await update({
          id: detail._id,
          ...parsed.data,
          accountId: accountID as Id<"accounts">,
        });
        toast.success("اشتراک با موفقیت ویرایش شد");
      } else {
        await add({
          ...parsed.data,
          accountId: accountID as Id<"accounts">,
        });
        toast.success("اشتراک با موفقیت ثبت شد");
      }
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت اشتراک. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form id={formId} className="px-1 sm:px-2" onSubmit={handleSubmit}>
      <div className="flex max-w-2xl flex-col gap-2">
        <Label htmlFor="sub-title" className="text-muted text-sm">
          نام اشتراک
        </Label>
        <Input
          id="sub-title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className="box input h-13"
          value={titleSubscription}
          onChange={(e) => setTitleSubscription(e.target.value)}
        />
      </div>

      <section className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:mt-5.5 sm:grid-cols-2 sm:gap-5">
        <FormSelect
          label="دسته بندی"
          value={categoryID}
          onChange={setCategoryID}
          options={categoryOptions}
        />
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="sub-amount" className="text-muted text-sm">
            مبلغ (تومان) *
          </Label>
          <Input
            id="sub-amount"
            placeholder="0"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="box input h-13 text-right"
            value={formatNumber(priceSubscription)}
            onChange={(e) => setPriceSubscription(e.target.value)}
          />
        </div>
      </section>

      <section className="mt-4 flex max-w-2xl flex-col gap-2 sm:mt-5.5">
        <Label className="text-muted text-sm">دوره پرداخت</Label>
        <div className="grid w-full max-w-2xl grid-cols-4 gap-x-1 rounded-xl border border-secondary bg-secondary p-1.5">
          {CYCLES.map((cycle) => (
            <button
              key={cycle.value}
              type="button"
              className={`transaction-type   whitespace-nowrap ${
                subscriptionTimeCycle === cycle.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-secondary/80"
              }`}
              onClick={() => setSubscriptionTimeCycle(cycle.value)}
            >
              {cycle.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:mt-5.5 sm:grid-cols-2 sm:gap-5">
        <DatePickerInput
          date={nextPaymentDate}
          onDate={setNextPaymentDate}
          title="تاریخ پرداخت"
        />
        <FormSelect
          label="حساب متصل"
          value={accountID}
          onChange={setAccountID}
          options={accountOptions}
        />
      </section>

      <div className="mt-4 flex max-w-2xl flex-col gap-2 sm:mt-5.5">
        <Label className="text-muted text-sm">وضعیت</Label>
        <FormTab
          tabs={tabs}
          selectedTab={subscriptionType}
          setSelectedTab={(val: string) =>
            setSubscriptionType(val as subscriptionTypeState)
          }
        />
      </div>
    </Form>
  );
};

export default SubscriptionForm;

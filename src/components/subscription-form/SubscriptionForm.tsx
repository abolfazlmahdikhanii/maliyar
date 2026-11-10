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
    <Form id={formId} className="px-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 max-w-2xl ">
        <Label htmlFor="title" className="text-muted text-sm">
          نام اشتراک
        </Label>
        <Input
          id="title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className={"box input h-13"}
          value={titleSubscription}
          onChange={(e) => setTitleSubscription(e.target.value)}
        />
      </div>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <div>
          <FormSelect
            label="دسته بندی"
            value={categoryID}
            onChange={setCategoryID}
            options={categoryOptions}
          />
        </div>
        <div className="flex flex-col gap-2 max-w-2xl">
          <Label htmlFor="title" className="text-muted text-sm">
            مبلغ (تومان) *
          </Label>
          <Input
            id="title"
            placeholder="0"
            type="text"
            className={"box input h-13"}
            value={formatNumber(priceSubscription)}
            onChange={(e) => setPriceSubscription(e.target.value)}
          />
        </div>
      </section>
      <section className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          دوره پرداخت
        </Label>

        <section className="grid grid-cols-4 w-full p-1.5 gap-x-1 bg-secondary rounded-xl max-w-2xl border border-secondary">
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "weekly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("weekly")}
          >
            هفتگی
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "monthly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("monthly")}
          >
            ماهانه
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "three-month"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("three-month")}
          >
            سه ماهه
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "yearly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("yearly")}
          >
            سالانه
          </div>
        </section>
      </section>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <DatePickerInput
          date={nextPaymentDate}
          onDate={setNextPaymentDate}
          title="تاریخ پرداخت"
        />
        <div>
          <FormSelect
            label="حساب متصل"
            value={accountID}
            onChange={setAccountID}
            options={accountOptions}
          />
        </div>
      </section>

      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          وضعیت
        </Label>
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

import {
  Form,
  Input,
  type Key,
  Label,
  TextArea,
  type TimeValue,
  toast,
} from "@heroui/react";
import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { type SyntheticEvent, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Category } from "../../../data/categories";
import { getBankName } from "../../utils/bankDetector";
import { transactionSchema } from "../../validators/transactions";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import type { TabForm } from "../dues-form/DuesForm";
import TimeInput from "../time-input/TimeInput";
import Categories from "../ui/categories/Categories";
import FormSelect from "../ui/form-select/FormSelect";
import FormTab from "../ui/form-tab/FormTab";
import InputPrice from "../ui/input-price/InputPrice";

type transactionTypeState = "income" | "outcome";
export type paymentMethodState = "card" | "wallet";

const tabs: TabForm<transactionTypeState>[] = [
  {
    id: 1,
    title: "هزینه",
    value: "outcome",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
  {
    id: 2,
    title: "درآمد",
    value: "income",
    selectedColor: "bg-primary/15 text-primary",
  },
];
const PAYMENT_METHODS = [
  { id: "card", label: "کارت بانکی" },
  { id: "wallet", label: "نقدی" },
];

type Detail = {
  type: transactionTypeState;
  amount: number;
  title: string | undefined;
  category: Category | undefined;
  transactionId: Id<"transactions">;
  paymentMethod: paymentMethodState;
  date: DateValue | null;
  time?: TimeValue | null;
  note?: string;
  accountId?: string;
};

type TransactionFormProps = {
  detail?: Detail;
} & FormProps;

const TransactionForm = ({
  loading,
  onLoadingChange,
  onSuccess,
  formId,
  detail,
}: TransactionFormProps) => {
  const accounts = useQuery(api.accounts.list);
  const add = useMutation(api.transactions.add);
  const update = useMutation(api.transactions.update);

  const [transactionType, setTransactionType] = useState<transactionTypeState>(
    detail?.type || "outcome",
  );

  const [categoryTransactionId, setCategoryTransactionId] = useState<
    string | null
  >(detail?.category ? detail.category?.id : null);
  const [transactionPrice, setTransactionPrice] = useState<string>(
    detail?.amount ? String(detail?.amount) : "0",
  );
  const [title, setTitle] = useState<string>(detail?.title ?? "");
  const [accountID, setAccountID] = useState<Key | null>(
    detail?.accountId ?? null,
  );
  const [paymentMethod, setPaymentMethod] = useState<paymentMethodState>(
    detail?.paymentMethod ?? "card",
  );
  const [note, setNote] = useState<string>(detail?.note ?? "");
  const [date, setDate] = useState<DateValue | null>(
    detail?.date ?? today(getLocalTimeZone()),
  );
  const [time, setTime] = useState<TimeValue | null>(detail?.time ?? null);
 

  const accountOptions = (accounts ?? [])
    .filter((a) => a.type === paymentMethod)
    .map((a) => ({ id: a._id, label: getBankName(a.bank) }));

  const submitTransactionHandler = async (
    e: SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (loading) return;

    const transactionData = transactionSchema.safeParse({
      type: transactionType,
      amount: transactionPrice,
      title: title.trim(),
      categoryId: categoryTransactionId,
      accountId: accountID,
      paymentMethod: paymentMethod,
      date: date,
      time: time,
      note: note.trim(),
    });
    if (!transactionData.success) {
      return toast.danger(transactionData.error.issues[0].message);
    }
    onLoadingChange(true);
    try {
      if (!detail) {
        await add({
          ...transactionData.data,
          accountId: transactionData.data.accountId as Id<"accounts">,
        });
        toast.success("تراکنش با موفقیت ایجاد شد");
      } else {
        await update({
          ...transactionData.data,
          accountId: transactionData.data.accountId as Id<"accounts">,
          id: detail.transactionId,
        });
        toast.success("تراکنش با موفقیت ویرایش شد");
      }
      onSuccess?.();
    } catch (error) {
      console.log(error);
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت تراکنش. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form className="px-2" id={formId} onSubmit={submitTransactionHandler}>
      <FormTab
        tabs={tabs}
        selectedTab={transactionType}
        setSelectedTab={(val: string) =>
          setTransactionType(val as transactionTypeState)
        }
      />
      {/* price */}
      <InputPrice price={transactionPrice} setPrice={setTransactionPrice} />
      <div className="flex flex-col gap-2 max-w-2xl mt-7">
        <Label htmlFor="title" className="text-muted text-sm">
          عنوان (اختیاری)
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          id="title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className={"box input h-13"}
        />
      </div>
      <Categories
        categoryId={categoryTransactionId}
        setCategoryId={setCategoryTransactionId}
  
      />
      <section className="mt-5 grid max-w-2xl grid-cols-1 gap-4 sm:mt-5.5 sm:grid-cols-2 sm:gap-5">
        <FormSelect
          label="نوع پرداخت"
          value={paymentMethod}
          onChange={(value) => {
            setPaymentMethod(value as paymentMethodState);
            setAccountID(null);
          }}
          options={PAYMENT_METHODS}
        />
        <FormSelect
          label="حساب"
          value={accountID}
          onChange={setAccountID}
          options={accountOptions}
        />
      </section>
      <section className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:mt-5.5 sm:grid-cols-2 sm:gap-5">
        <DatePickerInput date={date} onDate={setDate} />

        <TimeInput time={time} onTime={setTime} />
      </section>
      <section className="max-w-2xl mt-5.5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="note" className="text-muted text-sm">
            یادداشت{" "}
          </Label>
          <TextArea
            id="note"
            aria-label="note"
            className="box input h-24 w-full resize-none"
            placeholder="توضیحات اختیاری..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </section>
    </Form>
  );
};

export default TransactionForm;

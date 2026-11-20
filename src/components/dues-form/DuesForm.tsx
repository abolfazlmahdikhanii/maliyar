import { Form, Input, Label, TextArea, toast } from "@heroui/react";
import {
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import { duesSchema } from "../../validators/dues";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import FormTab from "../ui/form-tab/FormTab";
import InputPrice from "../ui/input-price/InputPrice";

type duesTypeState = "debt" | "claim";

export interface TabForm<T> {
  id: number;
  title: string;
  value: T;
  selectedColor: string;
}

const tabs: TabForm<duesTypeState>[] = [
  {
    id: 1,
    title: "بدهی من",
    value: "debt",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
  {
    id: 2,
    title: "طلب من",
    value: "claim",
    selectedColor: "bg-primary/15 text-primary",
  },
];
const DuesForm = ({
  formId,
  onLoadingChange,
  onSuccess,
  loading,
}: FormProps) => {
  const add = useMutation(api.dues.add);
  const [duesType, setDuesType] = useState<duesTypeState>("debt");
  const [duesPrice, setDuesPrice] = useState<string>("0");
  const [duesParty, setDuesParty] = useState<string>("");
  const [duesReason, setDuesReason] = useState<string>("");
  const [date, setDate] = useState<DateValue | null>(()=>today(getLocalTimeZone()));

  const submitDuesHandler = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const dueData = duesSchema.safeParse({
      type: duesType,
      amount: duesPrice,
      party: duesParty,
      dueDate: date,
      reason: duesReason,
    });
    if (!dueData.success) {
      return toast.danger(dueData.error.issues[0].message);
    }
    onLoadingChange(true);
    try {
      await add(dueData.data);
      toast.success(
        `${duesType === "claim" ? "طلب" : "بدهی"} با موفقیت ثبت شد`,
      );
      onSuccess?.();
    } catch (error) {
      console.log(error);
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : `خطا در ثبت ${duesType === "claim" ? "طلب" : "بدهی"}. لطفاً دوباره تلاش کنید.`,
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form className="px-1 sm:px-2" id={formId} onSubmit={submitDuesHandler}>
      <FormTab
        tabs={tabs}
        selectedTab={duesType}
        setSelectedTab={(val: string) => setDuesType(val as duesTypeState)}
      />

      {/* price */}
      <InputPrice price={duesPrice} setPrice={setDuesPrice} />

      <section className="mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:mt-7.5 sm:grid-cols-2 sm:gap-5">
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="party" className="text-muted text-sm">
            طرف حساب
          </Label>
          <Input
            id="party"
            placeholder="نام شخص یا شرکت"
            type="text"
            className="box input h-13"
            onChange={(e) => setDuesParty(e.target.value)}
            value={duesParty}
          />
        </div>
        <DatePickerInput date={date} onDate={setDate} />
      </section>

      <section className="mt-4 max-w-2xl sm:mt-5.5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reason" className="text-muted text-sm">
            علت یا شرح
          </Label>
          <TextArea
            id="reason"
            aria-label="reason"
            className="box input h-24 w-full resize-none"
            placeholder="توضیحات ..."
            onChange={(e) => setDuesReason(e.target.value)}
            value={duesReason}
          />
        </div>
      </section>
    </Form>
  );
};

export default DuesForm;

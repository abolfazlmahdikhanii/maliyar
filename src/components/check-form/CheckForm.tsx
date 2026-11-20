import { Form, Input, Label, toast, type Key } from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { banks } from "../../../data/banks";
import { checkSchema } from "../../validators/checks";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import type { TabForm } from "../dues-form/DuesForm";
import FormSelect from "../ui/form-select/FormSelect";
import FormTab from "../ui/form-tab/FormTab";
import InputPrice from "../ui/input-price/InputPrice";

const bankOptions = banks.map((b) => ({ id: b.code, label: b.name }));
type checkTypeState = "incomeCheck" | "outcomeCheck";

const tabs: TabForm<checkTypeState>[] = [
  {
    id: 1,
    title: "چک دریافتی",
    value: "incomeCheck",
    selectedColor: "bg-primary/15 text-primary",
  },
  {
    id: 2,
    title: "چک پرداختی",
    value: "outcomeCheck",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
];

type CheckFormProps = {
  detail?: Doc<"checks">;
} & FormProps;

const CheckForm = ({
  onLoadingChange,
  loading,
  formId,
  onSuccess,
  detail,
}: CheckFormProps) => {
  const create = useMutation(api.checks.create);
  const update = useMutation(api.checks.update);
  const [checkType, setCheckType] = useState<checkTypeState>(
    detail?.direction === "issued" ? "outcomeCheck" : "incomeCheck",
  );
  const [price, setPrice] = useState<string>(
    detail ? String(detail.amount) : "0",
  );
  const [serial, setSerial] = useState<string>(detail?.serial ?? "");
  const [bank, setBank] = useState<Key | null>(detail?.bank ?? null);
  const [party, setParty] = useState<string>(detail?.party ?? "");
  const [issueDate, setIssueDate] = useState<DateValue | null>(
    detail ? parseDate(detail.issueDate) : null,
  );
  const [dueDate, setDueDate] = useState<DateValue | null>(
    detail ? parseDate(detail.dueDate) : null,
  );

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = checkSchema.safeParse({
      direction: checkType === "incomeCheck" ? "received" : "issued",
      amount: price,
      serial,
      bank: bank ? String(bank) : "",
      party,
      issueDate,
      dueDate,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    onLoadingChange(true);
    try {
      if (detail) {
        await update({ id: detail._id, ...parsed.data });
        toast.success("چک با موفقیت ویرایش شد");
      } else {
        await create(parsed.data);
        toast.success("چک با موفقیت ثبت شد");
      }
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت چک. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form id={formId} className="px-1 sm:px-2" onSubmit={handleSubmit}>
      <FormTab
        tabs={tabs}
        selectedTab={checkType}
        setSelectedTab={(val: string) => setCheckType(val as checkTypeState)}
      />
      <div className="mt-4">
        <InputPrice price={price} setPrice={setPrice} />
      </div>

      <section className="mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5">
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="serial" className="text-muted text-sm">
            شماره سریال
          </Label>
          <Input
            id="serial"
            placeholder="284591"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="box input h-13 text-right"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </div>
        <FormSelect
          label="بانک"
          value={bank}
          onChange={setBank}
          options={bankOptions}
        />
      </section>

      <div className="mt-4 flex max-w-2xl flex-col gap-2 sm:mt-5.5">
        <Label htmlFor="party" className="text-muted text-sm">
          {checkType === "incomeCheck" ? "در وجه (صادرکننده)" : "در وجهِ"}
        </Label>
        <Input
          id="party"
          placeholder="نام شخص / شرکت"
          type="text"
          className="box input h-13"
          value={party}
          onChange={(e) => setParty(e.target.value)}
        />
      </div>

      <section className="mb-3 mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:mt-5.5 sm:grid-cols-2 sm:gap-5">
        <DatePickerInput
          title="تاریخ صدور چک"
          date={issueDate}
          onDate={setIssueDate}
        />
        <DatePickerInput
          title="تاریخ سررسید چک"
          date={dueDate}
          onDate={setDueDate}
        />
      </section>
    </Form>
  );
};

export default CheckForm;

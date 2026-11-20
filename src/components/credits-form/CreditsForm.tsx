import { Form, Input, Label, toast, type DateValue } from "@heroui/react";
import {
  getLocalTimeZone,
  GregorianCalendar,
  parseDate,
  PersianCalendar,
  toCalendar,
  today,
} from "@internationalized/date";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useRef, useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatNumber } from "../../utils/formatNumber";
import { loanSchema } from "../../validators/loans";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";

type CreditsFormProps = {
  detail?: Doc<"loans">;
} & FormProps;

const plusOneJalaliMonth = (d: DateValue) =>
  toCalendar(
    toCalendar(d, new PersianCalendar()).add({ months: 1 }),
    new GregorianCalendar(),
  );

const CreditsForm = ({
  formId,
  loading,
  onLoadingChange,
  onSuccess,
  detail,
}: CreditsFormProps) => {
  const add = useMutation(api.loans.add);
  const update = useMutation(api.loans.update);

  const [title, setTitle] = useState(detail?.title ?? "");
  const [interestRate, setInterestRate] = useState(
    detail ? String(detail.interestRate) : "",
  );
  const [receivedDate, setReceivedDate] = useState<DateValue | null>(
    detail ? parseDate(detail.receivedDate) : today(getLocalTimeZone()),
  );
  const [firstDueDate, setFirstDueDate] = useState<DateValue | null>(
    detail
      ? parseDate(detail.firstDueDate)
      : plusOneJalaliMonth(today(getLocalTimeZone())),
  );
  const firstDueTouched = useRef(Boolean(detail));
  const [installmentAmount, setInstallmentAmount] = useState(
    detail ? String(detail.installmentAmount) : "",
  );
  const [installmentCount, setInstallmentCount] = useState(
    detail ? String(detail.installmentCount) : "",
  );

  const changeReceivedDate = (date: DateValue | null) => {
    setReceivedDate(date);

    if (date && !firstDueTouched.current) {
      setFirstDueDate(plusOneJalaliMonth(date));
    }
  };

  const reset = () => {
    const now = today(getLocalTimeZone());
    setTitle("");
    setInterestRate("");
    setReceivedDate(now);
    setFirstDueDate(plusOneJalaliMonth(now));
    firstDueTouched.current = false;
    setInstallmentAmount("");
    setInstallmentCount("");
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = loanSchema.safeParse({
      title,
      interestRate,
      receivedDate,
      firstDueDate,
      installmentAmount,
      installmentCount,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    onLoadingChange(true);
    try {
      if (detail) {
        await update({ ...parsed.data, id: detail._id });
        toast.success("تغییرات وام ذخیره شد.");
      } else {
        await add(parsed.data);
        reset();
        toast.success("وام با موفقیت ثبت شد.");
      }
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت وام. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Form id={formId} className="px-1 sm:px-2" onSubmit={handleSubmit}>
      <section>
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="loan-title" className="text-sm text-muted">
            عنوان وام
          </Label>
          <Input
            id="loan-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="وام مسکن"
            type="text"
            className="box input max-h-12.5"
          />
        </div>
      </section>

      <section className="mt-5 grid max-w-2xl grid-cols-1 gap-4 sm:mt-7.5 sm:grid-cols-2 sm:gap-5">
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="loan-rate" className="text-sm text-muted">
            نرخ بهره (٪ سالانه)
          </Label>
          <Input
            id="loan-rate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="18"
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="box input max-h-12.5 text-right"
          />
        </div>
        <DatePickerInput
          date={receivedDate}
          onDate={changeReceivedDate}
          title="تاریخ دریافت وام"
        />
      </section>

      <section className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:mt-7.5 sm:grid-cols-2 sm:gap-5">
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="loan-amount" className="text-sm text-muted">
            قسط ماهانه (تومان)
          </Label>
          <Input
            id="loan-amount"
            value={formatNumber(installmentAmount)}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            placeholder="5,000,000"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="box input max-h-12.5 text-right"
          />
        </div>
        <div className="flex max-w-2xl flex-col gap-2">
          <Label htmlFor="loan-count" className="text-sm text-muted">
            مدت (ماه)
          </Label>
          <Input
            id="loan-count"
            value={installmentCount}
            onChange={(e) => setInstallmentCount(e.target.value)}
            placeholder="36"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="box input max-h-12.5 text-right"
          />
        </div>
      </section>

      <section className="mb-2 mt-4 max-w-2xl sm:mt-7.5">
        <DatePickerInput
          date={firstDueDate}
          onDate={(date) => {
            firstDueTouched.current = true;
            setFirstDueDate(date);
          }}
          title="تاریخ سررسید اولین قسط"
        />
      </section>
    </Form>
  );
};

export default CreditsForm;

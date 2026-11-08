import { Form, Input, Label, toast, type Key } from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { GOAL_CATEGORIES } from "../../../data/goalCategories";
import { getBankName } from "../../utils/bankDetector";
import { formatNumber } from "../../utils/formatNumber";
import { goalSchema } from "../../validators/goals";
import type { FormProps } from "../accounts-form/AccountsForm";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import FormSelect from "../ui/form-select/FormSelect";

const NO_ACCOUNT = "none";

const categoryOptions = GOAL_CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
}));

type GoalFormProps = {
  detail?: Doc<"goals">;
} & FormProps;

const GoalForm = ({
  formId,
  loading,
  onLoadingChange,
  detail,
  onSuccess,
}: GoalFormProps) => {
  const accounts = useQuery(api.accounts.list);
  const add = useMutation(api.goals.add);
  const update = useMutation(api.goals.update);

  const [title, setTitle] = useState<string>(detail?.title ?? "");
  const [categoryID, setCategoryID] = useState<Key | null>(
    detail?.categoryId ?? null,
  );
  const [targetAmount, setTargetAmount] = useState<string>(
    detail ? String(detail.targetAmount) : "0",
  );
  const [savedAmount, setSavedAmount] = useState<string>(
    detail ? String(detail.savedAmount) : "0",
  );
  const [deadline, setDeadline] = useState<DateValue | null>(
    detail?.deadline ? parseDate(detail.deadline) : null,
  );
  const [accountID, setAccountID] = useState<Key | null>(
    detail?.accountId ?? NO_ACCOUNT,
  );

  const accountOptions = [
    { id: NO_ACCOUNT, label: "بدون حساب متصل" },
    ...(accounts ?? []).map((a) => ({ id: a._id, label: getBankName(a.bank) })),
  ];

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = goalSchema.safeParse({
      title,
      categoryId: categoryID ? String(categoryID) : "",
      targetAmount,
      savedAmount,
      deadline,
      accountId:
        accountID && accountID !== NO_ACCOUNT ? String(accountID) : undefined,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    const payload = {
      ...parsed.data,
      accountId: parsed.data.accountId as Id<"accounts"> | undefined,
    };

    onLoadingChange(true);
    try {
      if (detail) {
        await update({ id: detail._id, ...payload });
        toast.success("هدف با موفقیت ویرایش شد");
      } else {
        await add(payload);
        toast.success("هدف با موفقیت ثبت شد");
      }
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت هدف. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Form id={formId} className="px-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 max-w-2xl">
        <Label htmlFor="goal-title" className="text-muted text-sm">
          نام هدف
        </Label>
        <Input
          id="goal-title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className="box input h-13"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <FormSelect
          label="دسته"
          value={categoryID}
          onChange={setCategoryID}
          options={categoryOptions}
        />
        <div className="flex flex-col gap-2 max-w-2xl">
          <Label htmlFor="goal-target" className="text-muted text-sm">
            مبلغ هدف (تومان) *
          </Label>
          <Input
            id="goal-target"
            placeholder="0"
            type="text"
            inputMode="numeric"
            className="box input h-13"
            value={formatNumber(targetAmount)}
            onChange={(e) => setTargetAmount(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <div className="flex flex-col gap-2 max-w-2xl">
          <Label htmlFor="goal-saved" className="text-muted text-sm">
            پس انداز فعلی (تومان) *
          </Label>
          <Input
            id="goal-saved"
            placeholder="0"
            type="text"
            inputMode="numeric"
            className="box input h-13"
            value={formatNumber(savedAmount)}
            onChange={(e) => setSavedAmount(e.target.value)}
          />
        </div>
        <DatePickerInput
          title="مهلت (اختیاری)"
          date={deadline}
          onDate={setDeadline}
        />
      </section>

      <section className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <FormSelect
          label="حساب پس‌انداز (اختیاری — هنگام پس‌انداز از این حساب کسر می‌شود)"
          value={accountID}
          onChange={setAccountID}
          options={accountOptions}
        />
      </section>
    </Form>
  );
};

export default GoalForm;

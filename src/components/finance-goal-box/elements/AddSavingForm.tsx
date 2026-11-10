import { Button, Form, toast, type Key } from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getBankName } from "../../../utils/bankDetector";
import { addSavingsSchema } from "../../../validators/goals";
import type { FormProps } from "../../accounts-form/AccountsForm";
import FormSelect from "../../ui/form-select/FormSelect";
import InputPrice from "../../ui/input-price/InputPrice";

type Goal = FunctionReturnType<typeof api.goals.list>[number];

const NO_ACCOUNT = "none";

type AddSavingsFormProps = { goal: Goal } & FormProps;

const AddSavingsForm = ({
  goal,
  formId,
  loading,
  onLoadingChange,
  onSuccess,
}: AddSavingsFormProps) => {
  const accounts = useQuery(api.accounts.list);
  const addSavings = useMutation(api.goals.addSavings);

  const [price, setPrice] = useState<string>("0");

  const [accountID, setAccountID] = useState<Key | null>(
    goal.accountId ?? NO_ACCOUNT,
  );

  const accountOptions = [
    { id: NO_ACCOUNT, label: "بدون کسر از حساب" },
    ...(accounts ?? []).map((a) => ({
      id: a._id,
      label: `${getBankName(a.bank)} · ${a.balance.toLocaleString()} تومان`,
    })),
  ];

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = addSavingsSchema(goal.remainingAmount).safeParse({
      amount: price,
      accountId:
        accountID && accountID !== NO_ACCOUNT ? String(accountID) : undefined,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    onLoadingChange(true);
    try {
      const { completed } = await addSavings({
        id: goal._id,
        amount: parsed.data.amount,

        accountId: parsed.data.accountId
          ? (parsed.data.accountId as Id<"accounts">)
          : null,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success(completed ? "تبریک! هدف تکمیل شد" : "پس‌انداز ثبت شد");
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت پس‌انداز",
      );
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Form id={formId} className="px-2" onSubmit={handleSubmit}>
      <InputPrice price={price} setPrice={setPrice} />
      <div className="flex items-center justify-between mt-7 text-xs text-muted">
        <p>مانده تا تکمیل: {goal.remainingAmount.toLocaleString()} تومان</p>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-3 text-xs"
          onPress={() => setPrice(String(goal.remainingAmount))}
        >
          تکمیل کل مبلغ
        </Button>
      </div>

      <div className="max-w-2xl mt-5.5">
        <FormSelect
          label="کسر از حساب"
          value={accountID}
          onChange={setAccountID}
          options={accountOptions}
        />
      </div>
    </Form>
  );
};

export default AddSavingsForm;

import { Form, toast } from "@heroui/react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { budgetSchema } from "../../validators/budgets";
import type { FormProps } from "../accounts-form/AccountsForm";
import Categories from "../ui/categories/Categories";
import InputPrice from "../ui/input-price/InputPrice";

type Detail = {
  categoryId: string;
  limit: number;
  budgetId: Id<"budgets">;
};
type BudgetFormProps = {
  detail?: Detail;
} & FormProps;
const BudgetForm = ({
  loading,
  onLoadingChange,
  onSuccess,
  formId,
  detail,
}: BudgetFormProps) => {
  const add = useMutation(api.budgets.add);
  const update = useMutation(api.budgets.update);

  const [budgetPrice, setBudgetPrice] = useState<string>(
    detail?.limit ? String(detail.limit) : "0",
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    detail?.categoryId || null,
  );
  const submitBudgetHandler = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const budgetData = budgetSchema.safeParse({
      limit: budgetPrice,
      categoryId,
    });
    if (!budgetData.success)
      return toast.danger(budgetData.error.issues[0].message);
    onLoadingChange(true);
    try {
      if (detail?.budgetId) {
        await update({ ...budgetData.data, id: detail.budgetId });
        toast.success("بودجه با موفقیت ویرایش شد");
      } else {
        await add(budgetData.data);
        toast.success("بودجه با موفقیت اضافه شد");
      }
      onSuccess?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت بودجه. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form className="px-2 pb-4" id={formId} onSubmit={submitBudgetHandler}>
      <InputPrice price={budgetPrice} setPrice={setBudgetPrice} />
      <Categories categoryId={categoryId} setCategoryId={setCategoryId} />
    </Form>
  );
};

export default BudgetForm;

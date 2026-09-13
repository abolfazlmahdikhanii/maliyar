import { Form } from "@heroui/react";
import { useState } from "react";
import Categories from "../ui/categories/Categories";
import InputPrice from "../ui/input-price/InputPrice";

const BudgetForm = () => {
  const [budgetPrice, setBudgetPrice] = useState<string>("0");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  return (
    <Form className="px-2 pb-4">
      <InputPrice price={budgetPrice} setPrice={setBudgetPrice} />
      <Categories categoryId={categoryId} setCategoryId={setCategoryId} />
    </Form>
  );
};

export default BudgetForm;

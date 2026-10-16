import z from "zod";
import { faToEn } from "../utils/formatNumber";
import { required } from "../utils/shared";





export const budgetSchema = z.object({
  limit: z
    .string()
    .transform((s) => Number(faToEn(s).replace(/[^\d]/g, "")))
    .pipe(z.number().int().positive("مبلغ باید بیشتر از صفر باشد.")),

  categoryId: required("دسته‌بندی را انتخاب کنید."),
});

export type BudgetData = z.output<typeof budgetSchema>;

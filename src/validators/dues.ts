import z from "zod";
import { faToEn } from "../utils/formatNumber";


const toIsoDate = (v: unknown) => (v ? String(v) : "");

export const duesSchema = z.object({
  type: z.enum(["debt", "claim"]),

  amount: z
    .string()
    .transform((s) => Number(faToEn(s).replace(/[^\d]/g, "")))
    .pipe(z.number().positive("مبلغ باید بیشتر از صفر باشد.")),

  party: z.string().trim().min(1, "طرف حساب را وارد کنید."),
  dueDate: z.preprocess(
    toIsoDate,
    z
      .string()
      .min(1, "تاریخ سررسید را انتخاب کنید.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ سررسید معتبر نیست."),
  ),

  reason: z.string().trim().max(500, "توضیح خیلی طولانی است.").optional(),
});

export type DuesData = z.output<typeof duesSchema>;

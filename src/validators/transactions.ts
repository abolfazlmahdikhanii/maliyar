import z from "zod";
import { faToEn } from "../utils/formatNumber";
import { required } from "../utils/shared";



const toIsoDate = (v: unknown) => (v ? String(v) : "");

// TimeValue → "HH:mm"
const toTime = (v: unknown) => {
  if (!v || typeof v !== "object" || !("hour" in v) || !("minute" in v)) {
    return undefined;
  }
  const { hour, minute } = v as { hour: number; minute: number };
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const transactionSchema = z.object({
  type: z.enum(["income", "outcome"]),

  amount: z
    .string()
    .transform((s) => Number(faToEn(s).replace(/[^\d]/g, "")))
    .pipe(z.number().int().positive("مبلغ باید بیشتر از صفر باشد.")),

  title: z.string().trim().optional(),
  categoryId: required("دسته‌بندی را انتخاب کنید."),
  accountId: required("حساب را انتخاب کنید."),
  paymentMethod: z.enum(["card", "wallet"]),

  date: z.preprocess(
    toIsoDate,
    z
      .string()
      .min(1, "تاریخ را انتخاب کنید.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست."),
  ),
  time: z.preprocess(toTime, z.string().optional()),
  note: z.string().trim().optional(),
});

export type TransactionData = z.output<typeof transactionSchema>;

import z from "zod";
import { faToEn } from "../utils/formatNumber";
import { required } from "../utils/shared";

const toIsoDate = (v: unknown) => (v ? String(v) : "");

const NO_ACCOUNT = "none";

export const subscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "نام اشتراک را وارد کنید.")
    .max(100, "نام اشتراک خیلی طولانی است."),

  categoryId: required("دسته را انتخاب کنید."),

  amount: z
    .string()
    .transform((s) => Number(faToEn(s).replace(/[^\d]/g, "")))
    .pipe(
      z
        .number()
        .positive("مبلغ باید بیشتر از صفر باشد.")
        .max(1_000_000_000_000, "مبلغ بیش از حد بزرگ است."),
    ),

  cycle: z.enum(["weekly", "monthly", "three-month", "yearly"]),

  nextPaymentDate: z.preprocess(
    toIsoDate,
    z
      .string()
      .min(1, "تاریخ پرداخت بعدی را انتخاب کنید.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ پرداخت بعدی معتبر نیست."),
  ),

  
  accountId: z.preprocess(
    (v) => (v == null || v === "" || v === NO_ACCOUNT ? undefined : String(v)),
    z.string().optional(),
  ),

  status: z.enum(["active", "inactive"]),
});

export type SubscriptionData = z.output<typeof subscriptionSchema>;

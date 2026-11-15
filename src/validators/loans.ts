import z from "zod";
import { faToEn } from "../utils/formatNumber";

const toIsoDate = (v: unknown) => (v ? String(v) : "");

const isoDate = (emptyMessage: string, invalidMessage: string) =>
  z.preprocess(
    toIsoDate,
    z
      .string()
      .min(1, emptyMessage)
      .regex(/^\d{4}-\d{2}-\d{2}$/, invalidMessage),
  );

const digitsToNumber = (s: string) => Number(faToEn(s).replace(/[^\d]/g, ""));

const parseRate = (s: string) => {
  const n = Number(
    faToEn(s)
      .replace(/[٫,]/g, ".")
      .replace(/[^\d.]/g, ""),
  );
  return Number.isFinite(n) ? n : -1;
};

export const loanSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "عنوان وام را وارد کنید.")
      .max(100, "عنوان وام خیلی طولانی است."),

    interestRate: z
      .string()
      .trim()
      .min(1, "نرخ بهره را وارد کنید.")
      .transform(parseRate)
      .pipe(
        z
          .number()
          .min(0, "نرخ بهره معتبر نیست.")
          .max(100, "نرخ بهره باید بین ۰ تا ۱۰۰ باشد."),
      ),

    receivedDate: isoDate(
      "تاریخ دریافت وام را انتخاب کنید.",
      "تاریخ دریافت وام معتبر نیست.",
    ),

    firstDueDate: isoDate(
      "سررسید اولین قسط را انتخاب کنید.",
      "سررسید اولین قسط معتبر نیست.",
    ),

    installmentAmount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .positive("قسط ماهانه باید بیشتر از صفر باشد.")
          .max(1_000_000_000_000, "مبلغ قسط بیش از حد بزرگ است."),
      ),

    installmentCount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .min(1, "مدت وام باید حداقل ۱ ماه باشد.")
          .max(360, "مدت وام نمی‌تواند بیشتر از ۳۶۰ ماه باشد."),
      ),
  })

  .refine((d) => d.firstDueDate >= d.receivedDate, {
    path: ["firstDueDate"],
    message: "سررسید اولین قسط نمی‌تواند قبل از تاریخ دریافت وام باشد.",
  });

export type LoanData = z.output<typeof loanSchema>;

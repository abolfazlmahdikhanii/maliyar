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

export const checkSchema = z
  .object({
    direction: z.enum(["received", "issued"]),

    amount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .positive("مبلغ چک باید بیشتر از صفر باشد.")
          .max(1_000_000_000_000, "مبلغ چک بیش از حد بزرگ است."),
      ),

   
    serial: z
      .string()
      .transform((s) => faToEn(s).trim())
      .pipe(
        z
          .string()
          .min(1, "شماره سریال را وارد کنید.")
          .max(30, "شماره سریال خیلی طولانی است.")
          .regex(/^\d+$/, "شماره سریال فقط باید عدد باشد."),
      ),

    bank: z.string().min(1, "بانک را انتخاب کنید."),

    party: z
      .string()
      .trim()
      .min(1, "نام طرف حساب را وارد کنید.")
      .max(100, "نام طرف حساب خیلی طولانی است."),

    issueDate: isoDate(
      "تاریخ صدور چک را انتخاب کنید.",
      "تاریخ صدور چک معتبر نیست.",
    ),

    dueDate: isoDate(
      "تاریخ سررسید چک را انتخاب کنید.",
      "تاریخ سررسید چک معتبر نیست.",
    ),
  })
  .refine((d) => d.dueDate >= d.issueDate, {
    path: ["dueDate"],
    message: "سررسید نمی‌تواند قبل از تاریخ صدور باشد.",
  });

export type CheckData = z.output<typeof checkSchema>;
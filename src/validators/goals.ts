import z from "zod";
import { getGoalCategory } from "../../data/goalCategories";
import { faToEn } from "../utils/formatNumber";

const MAX_AMOUNT = 1_000_000_000_000;

const toIsoDate = (v: unknown) => (v ? String(v) : "");
const digitsToNumber = (s: string) => Number(faToEn(s).replace(/[^\d]/g, ""));


const optionalIsoDate = (invalidMessage: string) =>
  z.preprocess(
    toIsoDate,
    z
      .string()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, invalidMessage)
      .transform((s) => s || undefined),
  );

export const goalSchema = z
  .object({
   
    title: z.string().trim().max(100, "نام هدف خیلی طولانی است."),

    categoryId: z.string().min(1, "دسته را انتخاب کنید."),

    targetAmount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .positive("مبلغ هدف باید بیشتر از صفر باشد.")
          .max(MAX_AMOUNT, "مبلغ هدف بیش از حد بزرگ است."),
      ),

    savedAmount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .min(0, "پس‌انداز فعلی معتبر نیست.")
          .max(MAX_AMOUNT, "پس‌انداز فعلی بیش از حد بزرگ است."),
      ),

    deadline: optionalIsoDate("مهلت هدف معتبر نیست."),

   
    accountId: z.string().optional(),
  })
  .refine((d) => d.savedAmount <= d.targetAmount, {
    path: ["savedAmount"],
    message: "پس‌انداز فعلی نمی‌تواند بیشتر از مبلغ هدف باشد.",
  })
  .transform((d) => ({
    ...d,
    title: d.title || getGoalCategory(d.categoryId).label,
  }));

export type GoalData = z.output<typeof goalSchema>;

export const addSavingsSchema = (remaining: number) =>
  z.object({
    amount: z
      .string()
      .transform(digitsToNumber)
      .pipe(
        z
          .number()
          .positive("مبلغ باید بیشتر از صفر باشد.")
          .max(
            remaining,
            `فقط ${remaining.toLocaleString("en-US")} تومان تا تکمیل هدف مانده است.`,
          ),
      ),
   
    accountId: z.string().optional(),
  });

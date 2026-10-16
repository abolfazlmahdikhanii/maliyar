import { z } from "zod";
import { faToEn } from "../utils/formatNumber";


export const accountFormSchema = z
  .object({
    type: z.enum(["card", "wallet"]),

    cardNumber: z
      .string()
      .transform((s) => faToEn(s).replace(/\s/g, ""))
      .pipe(z.string().regex(/^(\d{16})?$/, "شماره کارت باید ۱۶ رقم باشد.")),

    iban: z
      .string()
      .transform((s) => faToEn(s).replace(/\s/g, "").replace(/^IR/i, ""))
      .pipe(
        z
          .string()
          .regex(/^(\d{24})?$/, "شماره شبا باید ۲۴ رقم (بدون IR) باشد."),
      ),

    initialBalance: z
      .string()
      .transform((s) => Number(faToEn(s).replace(/[^\d]/g, "")) || 0),

      bank:z.string()
  })

  .transform(({ type, cardNumber,bank, iban, initialBalance }) =>
    type === "wallet"
      ? { type,bank, initialBalance }
      : {
          type,
          initialBalance,
          bank,
          ...(cardNumber && { cardNumber }),
          ...(iban && { iban }),
        },
  );

export type AccountFormInput = z.input<typeof accountFormSchema>;
export type AccountData = z.output<typeof accountFormSchema>;

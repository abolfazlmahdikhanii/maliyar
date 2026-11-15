import z from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "نام را وارد کنید.").max(50, "نام خیلی طولانی است."),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید.").max(50, "نام خانوادگی خیلی طولانی است."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "نام کاربری باید ۳ تا ۲۰ حرف انگلیسی، عدد یا _ باشد."),
  email: z.string().trim().toLowerCase().email("ایمیل معتبر نیست."),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز فعلی را وارد کنید."),
    newPassword: z.string().min(8, "رمز جدید حداقل ۸ کاراکتر باشد.").max(100, "رمز جدید خیلی طولانی است."),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "تکرار رمز با رمز جدید یکی نیست.",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "رمز جدید باید با رمز فعلی فرق داشته باشد.",
  });
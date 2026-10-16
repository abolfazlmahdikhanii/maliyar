import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "نام را وارد کن."),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کن."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "۳ تا ۲۰ کاراکتر؛ فقط حروف انگلیسی، عدد و _"),
  email: z.string().trim().toLowerCase().email("ایمیل معتبر نیست."),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد."),
});

export const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "نام کاربری یا ایمیل را وارد کن."),
  password: z.string().min(1, "رمز عبور را وارد کن."),
});

export type RegisterData=z.infer<typeof registerSchema>;
export type LoginData=z.infer<typeof loginSchema>;
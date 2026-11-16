import { useAuthActions } from "@convex-dev/auth/react";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { useConvex } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { loginSchema, registerSchema } from "../../validators/auth";

export type LoginData = { identifier: string; password: string };
export type RegisterData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

type Mode = "login" | "register";

const inputClass = "h-13 box input rounded-xl";
const ltrInputClass = `${inputClass} text-left`;

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthActions();
  const convex = useConvex();
  const isRegister = mode === "register";

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
  };

  const register = async (values: RegisterData) => {
    const result = registerSchema.safeParse(values);
    if (!result.success) return toast.danger(result.error.issues[0].message);

    try {
      const taken = await convex.query(api.users.isUsernameTaken, {
        username: result.data.username,
      });
      if (taken) return toast.danger("این نام کاربری قبلا استفاده شده است.");

      await signIn("password", { flow: "signUp", ...result.data });
      toast.success("حساب ساخته شد.");
    } catch {
      toast.danger("ثبت‌نام انجام نشد. شاید این ایمیل قبلا ثبت شده باشد.");
    }
  };

  const login = async (values: LoginData) => {
    const result = loginSchema.safeParse(values);
    if (!result.success) return toast.danger(result.error.issues[0].message);

    const { identifier, password } = result.data;
    const wrong = "نام کاربری یا رمز عبور اشتباه است.";

    try {
      let email = identifier;
      if (!identifier.includes("@")) {
        const found = await convex.query(api.users.emailByUsername, {
          username: identifier,
        });
        if (!found) return toast.danger(wrong);
        email = found;
      }

      await signIn("password", { flow: "signIn", email, password });
    } catch {
      toast.danger(wrong);
    }
  };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const values = Object.fromEntries(new FormData(e.currentTarget));

    setLoading(true);
    try {
      await (isRegister
        ? register(values as RegisterData)
        : login(values as LoginData));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Form panel */}
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <span className="text-lg font-bold text-primary">مالیار</span>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold leading-snug">
            {isRegister ? "خوش اومدی به مالیار" : "خوش برگشتی"}
          </h1>
          <p className="mb-8 mt-3 text-base leading-8 text-white/60">
            {isRegister
              ? "حساب بساز و خرج‌ها، چک‌ها، اقساط و اشتراک‌هات رو یک‌جا ببین."
              : "وارد شو و ببین این ماه پولت کجا رفته."}
          </p>

          <form key={mode} onSubmit={onSubmit} className="flex flex-col gap-4">
            {isRegister ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    name="firstName"
                    className={"flex flex-col gap-2"}
                    isRequired
                    autoComplete="given-name"
                  >
                    <Label>نام</Label>
                    <Input className={inputClass} />
                    <FieldError />
                  </TextField>
                  <TextField
                    name="lastName"
                    className={"flex flex-col gap-2"}
                    isRequired
                    autoComplete="family-name"
                  >
                    <Label>نام خانوادگی</Label>
                    <Input className={inputClass} />
                    <FieldError />
                  </TextField>
                </div>

                <TextField
                  name="username"
                  isRequired
                  autoComplete="username"

                  className={"flex flex-col gap-2"}
                >
                  <Label>نام کاربری</Label>
                  <Input
                    dir="ltr"
                    placeholder="abmk"
                    className={ltrInputClass}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="email"
                  type="email"
                  className={"flex flex-col gap-2"}
                  isRequired
                  autoComplete="email"
                >
                  <Label>ایمیل</Label>
                  <Input
                    dir="ltr"
                    placeholder="you@example.com"
                    className={ltrInputClass}
                  />
                  <FieldError />
                </TextField>
              </>
            ) : (
              <TextField
                name="identifier"
                className={"flex flex-col gap-2"}
                isRequired
                autoComplete="username"
              >
                <Label>نام کاربری یا ایمیل</Label>
                <Input dir="ltr" className={ltrInputClass} />
                <FieldError />
              </TextField>
            )}

            <TextField
              name="password"
              type="password"
              isRequired
              autoComplete={isRegister ? "new-password" : "current-password"}

              className={"flex flex-col gap-2"}
            >
              <Label>رمز عبور</Label>
              <Input dir="ltr" className={ltrInputClass} />
              <FieldError />
            </TextField>

            <Button
              type="submit"
              isDisabled={loading}
              className="mt-2 h-13 w-full rounded-xl bg-primary text-base text-black"
            >
              {loading ? <Spinner /> : isRegister ? "ساخت حساب" : "ورود"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            {isRegister ? "حساب داری؟" : "حساب نداری؟"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-primary hover:underline"
            >
              {isRegister ? "وارد شو" : "ثبت‌نام کن"}
            </button>
          </p>
        </div>
      </section>

      {/* Illustration panel: fills the whole side */}
      <aside className="relative hidden overflow-hidden bg-primary lg:block">
        <img
          src={"/images/auth.svg"}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </aside>
    </main>
  );
};

export default Auth;

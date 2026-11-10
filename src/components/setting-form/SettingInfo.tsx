import { Button, Input, Label, Spinner, toast } from "@heroui/react";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import { profileSchema } from "../../validators/settings";
import { Loader } from "../ui/loading-box/LoadingBox";
import SettingForm from "./SettingForm";

type User = NonNullable<FunctionReturnType<typeof api.users.me>>;

const SettingInfoForm = ({ info }: { info: User }) => {
  const update = useMutation(api.profile.update);
  const [firstName, setFirstName] = useState<string>(info.firstName ?? "");
  const [lastName, setLastName] = useState<string>(info.lastName ?? "");
  const [username, setUsername] = useState<string>(info.username ?? "");
  const [email, setEmail] = useState<string>(info.email ?? "");
  const [loading, setLoading] = useState(false);

  const updateUserHandler = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = profileSchema.safeParse({
      firstName,
      lastName,
      username,
      email,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    setLoading(true);
    try {
      await update(parsed.data);
      toast.success("اطلاعات با موفقیت ویرایش شد");
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ویرایش اطلاعات. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingForm
      id="info"
      title="اطلاعات حساب"
      description="نام و راه‌های ورود به حسابت"
      onSubmit={updateUserHandler}
    >
      <div className="grid grid-cols-2 gap-5 mt-0.5">
        <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
          <Label htmlFor="name" className="text-muted text-sm">
            نام
          </Label>
          <Input
            id="name"
            placeholder="نام را وارد کنید"
            type="text"
            className="box input h-13 placeholder:text-right"
            dir="auto"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
          <Label htmlFor="lastName" className="text-muted text-sm">
            نام خانوادگی
          </Label>
          <Input
            id="lastName"
            placeholder="نام خانوادگی را وارد کنید"
            type="text"
            className="box input h-13 placeholder:text-right"
            dir="auto"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 mt-2">
        <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
          <Label htmlFor="username" className="text-muted text-sm">
            نام کاربری
          </Label>
          <Input
            id="username"
            placeholder="نام کاربری را وارد کنید"
            type="text"
            className="box input h-13 placeholder:text-right"
            dir="ltr"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
          <Label htmlFor="email" className="text-muted text-sm">
            ایمیل
          </Label>
          <Input
            id="email"
            placeholder="ایمیل را وارد کنید"
            type="email"
            className="box input h-13 placeholder:text-right"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <Button
        className="h-12 rounded-xl w-32.5 text-sm bg-primary text-black mt-8 mb-1"
        type="submit"
        isDisabled={loading}
      >
        ذخیره تغییرات
        {loading && <Spinner color="current" size="sm" />}
      </Button>
    </SettingForm>
  );
};

type SettingInfoProps = {
  info: User | null | undefined;
};

const SettingInfo = ({ info }: SettingInfoProps) => {
  if (!info) {
    return (
      <SettingForm
        id="info"
        title="اطلاعات حساب"
        description="نام و راه‌های ورود به حسابت"
      >
        <Loader />
      </SettingForm>
    );
  }

  return <SettingInfoForm key={info.username} info={info} />;
};

export default SettingInfo;

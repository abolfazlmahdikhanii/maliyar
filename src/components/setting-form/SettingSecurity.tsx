import { Button, Input, Label, Spinner, toast } from "@heroui/react";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../convex/_generated/api";
import { passwordSchema } from "../../validators/settings";
import Logout from "../ui/logout/Logout";
import SettingForm from "./SettingForm";

const SettingSecurity = () => {
  const changePassword = useAction(api.security.changePassword);
  const [isSignout, setIsSignout] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const updatePasswordHandler = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const parsed = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirm,
    });
    if (!parsed.success) return toast.danger(parsed.error.issues[0].message);

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("رمز عبور تغییر کرد");

      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در تغییر رمز عبور",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingForm
      id="security"
      title="امنیت"
      description="رمز عبور رو هر چند وقت یک‌بار عوض کن"
      onSubmit={updatePasswordHandler}
    >
      <div className="mt-0.5 grid grid-cols-1 gap-5">
        <div className="mt-4 flex flex-col gap-2 sm:mt-5.5">
          <Label htmlFor="currentPassword" className="text-muted text-sm">
            رمز عبور فعلی
          </Label>
          <Input
            id="currentPassword"
            placeholder="********"
            type="password"
            className="box input h-13 placeholder:text-right"
            dir="ltr"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-2 sm:grid-cols-2 sm:gap-5">
        <div className="flex max-w-2xl flex-col gap-2 sm:mt-5.5">
          <Label htmlFor="newPassword" className="text-muted text-sm">
            رمز عبور جدید
          </Label>
          <Input
            id="newPassword"
            placeholder="********"
            type="password"
            autoComplete="new-password"
            className="box input h-13 placeholder:text-right"
            dir="ltr"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex max-w-2xl flex-col gap-2 sm:mt-5.5">
          <Label htmlFor="repeatNewPassword" className="text-muted text-sm">
            تکرار رمز جدید
          </Label>
          <Input
            id="repeatNewPassword"
            placeholder="********"
            type="password"
            autoComplete="new-password"
            className="box input h-13 placeholder:text-right"
            dir="ltr"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-1 mt-6 flex items-center gap-x-3 sm:mt-8 sm:gap-x-3.5">
        <Button
          className="h-12 flex-1 rounded-xl bg-primary text-sm text-black sm:w-32.5 sm:flex-none"
          type="submit"
          isDisabled={loading}
        >
          ذخیره تغییرات
          {loading && <Spinner color="current" size="sm" />}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-xl border-secondary text-sm sm:w-34 sm:flex-none"
          onPress={() => setIsSignout(true)}
        >
          خروج از حساب
        </Button>
      </div>

      <Logout
        isShowConfirm={isSignout}
        onChangeShowConfirm={() => setIsSignout(false)}
      />
    </SettingForm>
  );
};

export default SettingSecurity;

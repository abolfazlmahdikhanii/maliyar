import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "@heroui/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import ConfirmDialog from "../confirm-dialog/ConfirmDialog";

type LogoutProps = {
  isShowConfirm: boolean;
  onChangeShowConfirm: () => void;
};

const Logout = ({ isShowConfirm, onChangeShowConfirm }: LogoutProps) => {
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signOut();
      toast.success("با موفقیت خارج شدید");

      onChangeShowConfirm?.();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت چک. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ConfirmDialog
      isShowConfirm={isShowConfirm}
      onChangeShowConfirm={onChangeShowConfirm}
      title="خروج"
      description="آیا از می خواهید از حساب خارج شوید؟"
      loading={isLoading}
      onSubmit={handleLogout}
      isSignout
    />
  );
};

export default Logout;

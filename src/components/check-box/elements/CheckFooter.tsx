import { Button, toast, type Key } from "@heroui/react";
import {
  CheckCircleIcon,
  CloseCircleIcon,
  Pen2Icon,
  TrashBinMinimalistic2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

import { ConvexError } from "convex/values";
import CheckForm from "../../check-form/CheckForm";
import DeleteDialog from "../../ui/delete-dialog/DeleteDialog";
import FormModal from "../../ui/form-modal/FormModal";
import PayConfirm from "../../ui/pay-confirm/PayConfirm";

type Modal = "edit" | "delete" | "pay" | null;
type CheckFooterProps = {
  check: Doc<"checks">;
};
const CheckFooter = ({ check }: CheckFooterProps) => {
  const markCleared = useMutation(api.checks.markCleared);
  const markBounced = useMutation(api.checks.markBounced);
  const revert = useMutation(api.checks.revert);
  const remove = useMutation(api.checks.remove);

  const [modal, setModal] = useState<Modal>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoadingRevert, setIsLoadingRevert] = useState(false);
  const [isLoadingBounce, setIsLoadingBounce] = useState(false);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);

  const close = () => setModal(null);

  const isReceived = check.direction === "received";
  const isPending = check.status === "pending";

  const clearHandler = async (accountId: Key | Id<"accounts">) => {
    if (isLoadingConfirm) return;
    if (!accountId) return toast.danger("حساب را انتخاب کنید");
    setIsLoadingConfirm(true);
    try {
      await markCleared({
        id: check._id,
        accountId: accountId as Id<"accounts">,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success(
        `${isReceived ? "ثبت وصول" : "ثبت پرداخت"} چک با موفقیت انجام شد`,
      );
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : ` "خطا در ${isReceived ? "ثبت وصول" : "ثبت پرداخت"} چک"`,
      );
    } finally {
      setIsLoadingConfirm(false);
    }
  };

  const bounceHandler = async () => {
    if (isLoadingBounce) return;
    setIsLoadingBounce(true);
    try {
      await markBounced({ id: check._id });
      toast.success("برگشت چک ثبت شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت برگشت چک",
      );
    } finally {
      setIsLoadingBounce(false);
    }
  };
  const revertHandler = async () => {
    if (isLoadingRevert) return;
    setIsLoadingRevert(true);
    try {
      await revert({ id: check._id });
      toast.success("چک به حالت در انتظار برگشت");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در برگرداندن چک",
      );
    } finally {
      setIsLoadingRevert(false);
    }
  };
  const removeHandler = async () => {
    if (isLoadingDelete) return;
    setIsLoadingDelete(true);
    try {
      await remove({ id: check._id });
      toast.success("چک با موفقیت حذف شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در حذف چک!",
      );
    } finally {
      setIsLoadingDelete(false);
    }
  };

  return (
    <>
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-x-2.5">
          {isPending ? (
            <>
              <Button
                className="h-10 rounded-xl font-semibold px-4 text-xs bg-primary text-black"
                isDisabled={isLoadingConfirm}
                onPress={() => setModal("pay")}
              >
                <CheckCircleIcon size={20} />
                {isReceived ? "ثبت وصول" : "ثبت پرداخت"}
              </Button>
              <Button
                className="h-10 rounded-xl font-semibold px-4 text-xs"
                variant="danger-soft"
                isDisabled={isLoadingBounce}
                onPress={bounceHandler}
              >
                <CloseCircleIcon size={20} />
                ثبت برگشت
              </Button>
            </>
          ) : (
            <Button
              className="h-10 rounded-xl font-semibold px-4 text-xs bg-secondary"
              isDisabled={isLoadingRevert}
              onPress={revertHandler}
            >
              برگرداندن به در انتظار
            </Button>
          )}
        </div>
        <div className="flex items-center gap-x-2.5">
          {isPending && (
            <Button
              isIconOnly
              className="rounded-xl bg-secondary"
              onPress={() => setModal("edit")}
            >
              <Pen2Icon />
            </Button>
          )}
          <Button
            isIconOnly
            className="rounded-xl bg-secondary"
            onPress={() => setModal("delete")}
          >
            <TrashBinMinimalistic2Icon />
          </Button>
        </div>
      </section>

      <FormModal
        title="ویرایش چک"
        isOpen={modal === "edit"}
        onOpenChange={close}
        btnText="ذخیره تغییرات"
        formId="edit-check-form"
        loading={isLoadingEdit}
      >
        <CheckForm
          formId="edit-check-form"
          loading={isLoadingEdit}
          onLoadingChange={setIsLoadingEdit}
          onSuccess={close}
          detail={check}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={modal === "delete"}
        onChangeShowDelete={close}
        title="حذف چک"
        description={
          check.status === "cleared"
            ? "این چک وصول شده؛ با حذف آن، تراکنش مربوطه هم حذف و موجودی حساب برگردانده می‌شود. ادامه می‌دهید؟"
            : "آیا از حذف این چک اطمینان دارید؟"
        }
        loading={isLoadingDelete}
        onRemove={removeHandler}
      />
      <PayConfirm
        isOpen={modal === "pay"}
        loading={isLoadingConfirm}
        onSubmit={clearHandler}
        onOpenChange={close}
      />
    </>
  );
};

export default CheckFooter;

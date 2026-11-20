import { Button, Dropdown, Label, toast, type Key } from "@heroui/react";
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
import { MenuDotsBoldIcon } from "@solar-icons/react";

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
      <>
        <section className="hidden items-center justify-between sm:flex">
          <div className="flex items-center gap-x-2.5">
            {isPending ? (
              <>
                <Button
                  className="h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-black"
                  isDisabled={isLoadingConfirm}
                  onPress={() => setModal("pay")}
                >
                  <CheckCircleIcon size={20} />
                  {isReceived ? "ثبت وصول" : "ثبت پرداخت"}
                </Button>
                <Button
                  className="h-10 rounded-xl px-4 text-xs font-semibold"
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
                className="h-10 rounded-xl bg-secondary px-4 text-xs font-semibold"
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

        <section className="flex items-center gap-2 sm:hidden">
          {isPending ? (
            <Button
              className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-black"
              isDisabled={isLoadingConfirm}
              onPress={() => setModal("pay")}
            >
              <CheckCircleIcon size={20} />
              {isReceived ? "ثبت وصول" : "ثبت پرداخت"}
            </Button>
          ) : (
            <Button
              className="h-11 flex-1 rounded-xl bg-secondary text-sm font-semibold"
              isDisabled={isLoadingRevert}
              onPress={revertHandler}
            >
              برگرداندن به در انتظار
            </Button>
          )}

          <Dropdown>
            <Button
              variant="outline"
              isIconOnly
              className="size-11 shrink-0 rounded-xl border-secondary"
            >
              <MenuDotsBoldIcon size={20} />
            </Button>
            <Dropdown.Popover className="box-modal-2 w-60 md:w-auto ml-3 md:ml-0">
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "bounce") bounceHandler();
                  if (key === "edit") setModal("edit");
                  if (key === "delete") setModal("delete");
                }}
              >
                {isPending ? (
                  <Dropdown.Item
                    id="bounce"
                    textValue="bounce"
                    variant="danger"
                  >
                    <Label className="flex items-center gap-x-2.5">
                      <CloseCircleIcon size={18} />
                      ثبت برگشت
                    </Label>
                  </Dropdown.Item>
                ) : null}
                {isPending ? (
                  <Dropdown.Item id="edit" textValue="edit">
                    <Label className="flex items-center gap-x-2.5">
                      <Pen2Icon size={18} />
                      ویرایش
                    </Label>
                  </Dropdown.Item>
                ) : null}
                <Dropdown.Item id="delete" textValue="delete" variant="danger">
                  <Label className="flex items-center gap-x-2.5">
                    <TrashBinMinimalistic2Icon size={18} />
                    حذف
                  </Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </section>
      </>

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

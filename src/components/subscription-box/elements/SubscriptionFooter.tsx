import { Button, Dropdown, Label, toast, type Key } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  CheckReadIcon,
  PauseIcon,
  Pen2Icon,
  PlayIcon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import SubscriptionForm from "../../subscription-form/SubscriptionForm";
import ConfirmDialog from "../../ui/confirm-dialog/ConfirmDialog";
import DeleteDialog from "../../ui/delete-dialog/DeleteDialog";
import FormModal from "../../ui/form-modal/FormModal";
import PayConfirm from "../../ui/pay-confirm/PayConfirm";

type Modal = "edit" | "delete" | "pay" | "status" | null;
type SubscriptionFooterProps = {
  subscription: Doc<"subscriptions">;
};
const SubscriptionFooter = ({ subscription }: SubscriptionFooterProps) => {
  const remove = useMutation(api.subscriptions.remove);
  const pay = useMutation(api.subscriptions.markPaid);
  const toggle = useMutation(api.subscriptions.setStatus);

  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);
  const [isLoadingPay, setIsLoadingPay] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  const isActive = subscription.status === "active";
  const [modal, setModal] = useState<Modal>(null);

  const payHandler = async (accountID: Key | Id<"accounts">) => {
    if (isLoadingPay) return;
    if (!accountID) return toast.danger("حساب را انتخاب کنید");
    setIsLoadingPay(true);
    try {
      await pay({
        id: subscription._id,
        accountId: accountID as Id<"accounts">,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success("پرداخت با موفقیت انجام شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در ثبت پرداخت",
      );
    } finally {
      setIsLoadingPay(false);
    }
  };
  const removeHandler = async () => {
    if (isLoadingDelete) return;
    setIsLoadingDelete(true);
    try {
      await remove({ id: subscription._id });
      toast.success("اشتراک با موفقیت حذف شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در حذف اشتراک!",
      );
    } finally {
      setIsLoadingDelete(false);
    }
  };
  const toggleHandler = async () => {
    console.log("a");
    if (isLoadingStatus) return;
    setIsLoadingStatus(true);
    try {
      await toggle({
        id: subscription._id,
        status: isActive ? "inactive" : "active",
      });
      toast.success(isActive ? "اشتراک متوقف شد" : "اشتراک فعال شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در تغییر وضعیت اشتراک",
      );
    } finally {
      setIsLoadingStatus(false);
    }
  };
  return (
    <>
      <section className="flex items-center gap-x-4 mt-4.5">
        <Button
          className="h-13 rounded-xl w-full text-base bg-primary text-black"
          onPress={() => setModal("pay")}
        >
          <CheckReadIcon size={20} />
          ثبت پرداخت
        </Button>
        <div className="relative">
          <Dropdown>
            <Button
              variant="outline"
              isIconOnly
              className={" h-13 rounded-xl w-13.5 border-secondary"}
            >
              <MenuDotsBoldIcon size={20} />
            </Button>
            <Dropdown.Popover className={"box-modal-2"}>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "edit") setModal("edit");
                  if (key === "delete") setModal("delete");
                  if (key === "toggle") setModal("status");
                }}
              >
                <Dropdown.Item id="toggle" textValue="toggle">
                  <Label className="flex items-center gap-x-2.5">
                    {isActive ? (
                      <PauseIcon size={14} />
                    ) : (
                      <PlayIcon size={14} />
                    )}
                    {isActive ? "توقف" : "ازسرگیری"}
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item id="edit" textValue="Edit">
                  <Label className="flex items-center gap-x-2.5">
                    <Pen2Icon size={18} />
                    ویرایش
                  </Label>
                </Dropdown.Item>
                <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                  <Label className="flex items-center gap-x-2.5">
                    <TrashBin2Icon size={18} />
                    حذف
                  </Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </section>
      <FormModal
        title="ویرایش اشتراک"
        isOpen={modal === "edit"}
        onOpenChange={() => setModal(null)}
        btnText="ذخیره تغییرات"
        formId="edit-subscription-form"
        loading={isLoadingEdit}
      >
        <SubscriptionForm
          formId="edit-subscription-form"
          loading={isLoadingEdit}
          onLoadingChange={setIsLoadingEdit}
          onSuccess={() => setModal(null)}
          detail={subscription}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={modal === "delete"}
        onChangeShowDelete={() => setModal(null)}
        title="حذف اشتراک"
        description="آیا از حذف این اشتراک اطمینان دارید؟ تراکنش‌های قبلی حذف نمی‌شوند."
        loading={isLoadingDelete}
        onRemove={removeHandler}
      />
      <ConfirmDialog
        isShowConfirm={modal === "status"}
        onChangeShowConfirm={() => setModal(null)}
        title="تغییر وضعیت اشتراک"
        description="آیا از تغییر وضعیت این اشتراک اطمینان دارید؟"
        loading={isLoadingStatus}
        onSubmit={toggleHandler}
      />
      <PayConfirm
        isOpen={modal === "pay"}
        loading={isLoadingPay}
        onSubmit={payHandler}
        onOpenChange={() => setModal(null)}
        minBalance={subscription.amount}
        accountFilter={(a) => a.type === "card"}
        defaultAccountId={subscription.accountId}
      />
    </>
  );
};

export default SubscriptionFooter;

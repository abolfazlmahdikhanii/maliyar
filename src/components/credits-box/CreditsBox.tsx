import { Button, Dropdown, Label, toast, type Key } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  BillListIcon,
  CardIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatDay } from "../../utils/formatDate";
import CreditsForm from "../credits-form/CreditsForm";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FactorModal from "../ui/factor-modal/FactorModal";
import FormModal from "../ui/form-modal/FormModal";
import PayConfirm from "../ui/pay-confirm/PayConfirm";
import TomanIcon from "../ui/toman-icon/TomanIcon";

type Loans = FunctionReturnType<typeof api.loans.list>[number];
type CreditsBoxProps = {
  creditInfo: Loans;
};

const CreditsBox = ({ creditInfo }: CreditsBoxProps) => {
  const payInstallment = useMutation(api.loans.payInstallment);
  const remove = useMutation(api.loans.remove);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);
  const [isOpenFactorModal, setIsOpenFactorModal] = useState<boolean>(false);

  const payInstallmentHandler = async (accountID: Key | Id<"accounts">) => {
    if (isLoadingConfirm) return;
    if (!accountID) return toast.danger("حساب را انتخاب کنید");
    setIsLoadingConfirm(true);
    try {
      await payInstallment({
        id: creditInfo._id,
        accountId: accountID as Id<"accounts">,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success("پرداخت با موفقیت انجام شد");
      setIsShowConfirm(false);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در ثبت پرداخت",
      );
    } finally {
      setIsLoadingConfirm(false);
    }
  };

  const removeLoanHandler = async () => {
    if (isLoadingDelete) return;
    setIsLoadingDelete(true);
    try {
      await remove({ id: creditInfo._id });
      toast.success("وام با موفقیت حذف شد");
      setIsShowDelete(false);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در حذف وام!",
      );
    } finally {
      setIsLoadingDelete(false);
    }
  };

  return (
    <div className="box min-w-0 rounded-2xl">
      <section className="border-b border-b-secondary pb-5 sm:pb-7">
        <div className="flex flex-col gap-y-2.25">
          <p className="truncate font-extrabold text-neutral-100">
            {creditInfo.title}
          </p>
          <p className="text-xs text-muted">
            نرخ بهره {creditInfo.interestRate}% · بازپرداخت{" "}
            {creditInfo.installmentCount} ماهه
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted sm:mt-6 sm:gap-x-9">
          <span>
            کل وام:{" "}
            <span className="inline-flex items-center gap-x-1 font-extrabold text-[#ff6b6b]">
              {creditInfo.totalAmount?.toLocaleString()}
              <TomanIcon width="13" height="13" />
            </span>
          </span>
          <span>
            اقساط مانده:
            <span className="mr-1 inline-flex items-center gap-x-1 font-extrabold text-neutral-100">
              {creditInfo.remainingCount}
            </span>
          </span>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 pb-5 pt-5 sm:pb-7 sm:pt-6">
        <div className="flex min-w-0 flex-col items-center justify-center gap-y-1.5">
          <p className="text-xs text-muted">مانده بدهی</p>
          <p className="inline-flex max-w-full items-center gap-x-1 text-[13px] font-extrabold text-neutral-100 sm:gap-x-1.25 sm:text-base">
            <span className="truncate">
              {creditInfo.remainingDebt?.toLocaleString() ?? 0}
            </span>
            <TomanIcon width="14" height="14" />
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center gap-y-1.5">
          <p className="text-xs text-muted">پرداخت شده</p>
          <p className="inline-flex max-w-full items-center gap-x-1 text-[13px] font-extrabold text-primary sm:gap-x-1.25 sm:text-base">
            <span className="truncate">
              {creditInfo.paidAmount
                ? creditInfo.paidAmount.toLocaleString()
                : 0}
            </span>
            <TomanIcon width="14" height="14" />
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center gap-y-2">
          <p className="text-xs text-muted">سررسید بعدی</p>
          <p className="text-[13px] font-extrabold text-neutral-100 sm:text-[14px]">
            {creditInfo.nextDueDate
              ? formatDay(creditInfo.nextDueDate)
              : "تمام شد"}
          </p>
        </div>
      </section>

      <section className="flex items-center gap-x-3 sm:gap-x-4">
        <Button
          className="h-12 w-full rounded-xl bg-primary text-sm text-black sm:h-13 sm:text-base"
          onPress={() => setIsShowConfirm(true)}
          isDisabled={!creditInfo.nextDueDate}
        >
          <CardIcon size={20} className="rotate-35" />
          ثبت پرداخت این قسط
        </Button>
        <div className="relative shrink-0">
          <Dropdown>
            <Button
              variant="outline"
              isIconOnly
              className="h-12 w-12 rounded-xl border-secondary sm:h-13 sm:w-13.5"
            >
              <MenuDotsBoldIcon size={20} />
            </Button>
            <Dropdown.Popover className="box-modal-2 w-60 md:w-auto ml-3 md:ml-0">
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "edit") setIsOpenEditModal(true);
                  if (key === "delete") setIsShowDelete(true);
                  if (key === "factor") setIsOpenFactorModal(true);
                }}
              >
                <Dropdown.Item id="factor" textValue="factor">
                  <Label className="flex items-center gap-x-2.5">
                    <BillListIcon size={18} />
                    صورت حساب
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
        title="ویرایش وام"
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ذخیره تغییرات"
        formId="edit-loan-form"
        loading={isLoadingEdit}
      >
        <CreditsForm
          formId="edit-loan-form"
          loading={isLoadingEdit}
          onLoadingChange={setIsLoadingEdit}
          onSuccess={() => setIsOpenEditModal(false)}
          detail={creditInfo}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف وام"
        description="ایا از حذف این وام اطمینان دارید؟"
        loading={isLoadingDelete}
        onRemove={removeLoanHandler}
      />
      <PayConfirm
        isOpen={isShowConfirm}
        loading={isLoadingConfirm}
        onSubmit={payInstallmentHandler}
        onOpenChange={() => setIsShowConfirm(false)}
      />
      <FactorModal
        title="صورت‌حساب اقساط"
        isOpen={isOpenFactorModal}
        onOpenChange={() => setIsOpenFactorModal(false)}
        id={creditInfo._id}
      />
    </div>
  );
};

export default CreditsBox;
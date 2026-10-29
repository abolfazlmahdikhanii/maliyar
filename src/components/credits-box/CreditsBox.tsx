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
  const remove=useMutation(api.loans.remove)
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
    <div className="box rounded-2xl">
      <section className="pb-7 border-b border-b-secondary">
        {/* right */}
        <div>
          <div className="flex flex-col gap-y-2.25">
            <p className="font-extrabold text-neutral-100">
              {creditInfo.title}
            </p>
            <p className="text-xs text-muted">
              نرخ بهره {creditInfo.interestRate}% · بازپرداخت{" "}
              {creditInfo.installmentCount} ماهه
            </p>
          </div>
          <div className="text-xs text-muted mt-6 flex items-center gap-x-9">
            <span className="">
              مانده بدهی:{" "}
              <span className="font-extrabold text-[#ff6b6b] inline-flex items-center gap-x-1">
                {creditInfo.remainingDebt?.toLocaleString()}{" "}
                <TomanIcon width="13" height="13" />
              </span>
            </span>
            <span className="">
              اقساط مانده:
              <span className="font-extrabold text-neutral-100 inline-flex items-center gap-x-1 mr-1">
                {creditInfo.remainingCount}
              </span>
            </span>
          </div>
        </div>
      </section>
      <section className="pt-6 pb-7 flex items-center justify-around">
        <div className="flex flex-col items-center justify-center gap-y-1.5">
          <p className="text-xs text-muted">مانده بدهی </p>
          <p className="font-extrabold text-neutral-100 inline-flex items-center gap-x-1.25">
            {creditInfo.remainingDebt?.toLocaleString() ?? 0}{" "}
            <TomanIcon width="15" height="15" />
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-1.5">
          <p className="text-xs text-muted"> پرداخت شده </p>
          <p className="font-extrabold text-primary inline-flex items-center gap-x-1.25">
            {creditInfo?.paidAmount ?? 0} <TomanIcon width="15" height="15" />
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-y-2">
          <p className="text-xs text-muted">سررسید بعدی</p>
          <p className="font-extrabold text-neutral-100 text-[14px] ">
            {creditInfo.nextDueDate
              ? formatDay(creditInfo.nextDueDate)
              : "تمام شد"}
          </p>
        </div>
      </section>
      <section className="flex items-center gap-x-4">
        <Button
          className="h-13 rounded-xl w-full text-base bg-primary text-black"
          onClick={() => setIsShowConfirm(true)}
        >
          <CardIcon size={20} className="rotate-35" />
          ثبت پرداخت این قسط
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

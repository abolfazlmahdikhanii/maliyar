import { Button, Dropdown, Label, toast } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  ArrowLeftUpIcon,
  ArrowRightDownIcon,
  BillIcon,
  CopyIcon,
  Pen2Icon,
  TrashBin2Icon,
  WalletMoneyIcon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { cardFormatter } from "../../utils/cardFormatter";
import AccountsForm from "../accounts-form/AccountsForm";
import AccountsDetail from "../ui/accounts-detail/AccountsDetail";
import CardHolder from "../ui/card-holder/CardHolder";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FormModal from "../ui/form-modal/FormModal";
import TomanIcon from "../ui/toman-icon/TomanIcon";

export type Card = {
  balance: number;
  totalIncome: number;
  totalOutcome: number;
  transactionCount: number;
  type: "card" | "wallet";
  _id: Id<"accounts">;
  iban?: string;
  initialBalance?: number;
};

type CardBoxProps = {
  cardNumber?: string;
} & Card;

const CardBox = ({
  cardNumber,
  balance,
  totalIncome,
  totalOutcome,
  transactionCount,
  type,
  _id,
  iban,
  initialBalance,
}: CardBoxProps) => {
  const remove = useMutation(api.accounts.remove);
  const [isShowDetailModal, setIsShowDetailModal] = useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [loadingRemove, setLoadingRemove] = useState<boolean>(false);

  const removeAccountHandler = async () => {
    if (loadingRemove) return;
    setLoadingRemove(true);
    try {
      await remove({ id: _id });
      toast.success("حساب با موفقیت حذف شد");
      setIsShowDelete(false);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در حذف حساب!",
      );
    } finally {
      setLoadingRemove(false);
    }
  };

  const copyNumberHandler = (
    txt: string | undefined,
    type: "card" | "sheba",
  ) => {
    if (!txt) return toast.warning("متنی برای کپی کردن وجود ندارد");
    navigator.clipboard
      .writeText(txt)
      .then(() => {
        toast.success(
          `کپی ${type === "card" ? "شماره کارت" : "شماره شبا"} با موفقیت انجام شد`,
        );
      })
      .catch(() => {
        toast.danger(
          `کپی ${type === "card" ? "شماره کارت" : "شماره شبا"} با خطا مواجه شد`,
        );
      });
  };

  return (
    <div className="min-w-0">
      <CardHolder
        cardNumber={cardNumber ? cardFormatter(cardNumber) : [""]}
        type={type}
      />

      <div className="box rounded-b-2xl relative ">
        <p className="flex items-center gap-x-1 text-xs text-muted">
          <WalletMoneyIcon size={14} />
          موجودی فعلی
        </p>

        <div className="mr-1 mt-2.5">
          <p className="flex items-center gap-x-1 text-xl font-semibold tracking-wide text-white sm:text-2xl">
            {balance?.toLocaleString()}
            <span className="text-neutral-400">
              <TomanIcon width="16" height="16" />
            </span>
          </p>
        </div>

        <div className="mt-2.75 flex flex-wrap items-center gap-2 border-b border-secondary pb-4 sm:gap-x-2.5 sm:pb-4.5">
          <div className="flex items-center justify-center gap-x-1.25 rounded-xl border border-secondary bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary sm:px-3 sm:py-1.75">
            <ArrowRightDownIcon size={13} />
            <p>{totalIncome?.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-center gap-x-1.25 rounded-xl border border-secondary bg-secondary px-2.5 py-1.5 text-xs font-semibold text-danger sm:px-3 sm:py-1.75">
            <ArrowLeftUpIcon size={13} />
            <p>{totalOutcome?.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-center gap-x-1.25 rounded-xl border border-secondary bg-secondary px-2.5 py-1.5 text-xs text-muted sm:px-3 sm:py-1.75">
            <BillIcon size={13} />
            <p>{transactionCount} تراکنش</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-x-2.5">
          <Button
            onPress={() => setIsShowDetailModal(true)}
            className="h-10 rounded-xl border border-secondary bg-transparent px-4 text-xs font-semibold text-muted hover:bg-secondary hover:text-primary"
          >
            <BillIcon size={20} />
            تراکنش‌ها
          </Button>

          <div className="relative shrink-0">
            <Dropdown>
              <Button
                variant="outline"
                isIconOnly
                className="h-10 w-10.5 rounded-xl border-secondary"
              >
                <MenuDotsBoldIcon size={18} />
              </Button>
              <Dropdown.Popover className="box-modal-2 w-60 md:w-auto ml-3 md:ml-0">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "edit") setIsOpenEditModal(true);
                    if (key === "delete") setIsShowDelete(true);
                    if (key === "copy-card")
                      copyNumberHandler(cardNumber, "card");
                    if (key === "copy-sheba") copyNumberHandler(iban, "sheba");
                  }}
                >
                  <Dropdown.Item id="edit" textValue="Edit">
                    <Label className="flex items-center gap-x-2.5">
                      <Pen2Icon size={18} />
                      ویرایش
                    </Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="copy-card" textValue="copy-card">
                    <Label className="flex items-center gap-x-2.5">
                      <CopyIcon size={18} />
                      کپی شماره کارت
                    </Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="copy-sheba" textValue="copy-sheba">
                    <Label className="flex items-center gap-x-2.5">
                      <CopyIcon size={18} />
                      کپی شماره شبا
                    </Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete"
                    variant="danger"
                  >
                    <Label className="flex items-center gap-x-2.5">
                      <TrashBin2Icon size={18} />
                      حذف
                    </Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </div>

      <AccountsDetail
        isOpen={isShowDetailModal}
        onOpenChange={() => setIsShowDetailModal(false)}
        accountId={_id}
      />

      <FormModal
        title="ویرایش حساب"
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ذخیره تغییرات"
        formId="account-modal-edit"
        loading={loadingForm}
      >
        <AccountsForm
          key={_id ?? "new"}
          formId="account-modal-edit"
          onSuccess={() => setIsOpenEditModal(false)}
          onLoadingChange={setLoadingForm}
          loading={loadingForm}
          detail={{
            type,
            cardNumber,
            iban,
            initialBalance: initialBalance ? initialBalance : balance,
            accountID: _id,
          }}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف حساب"
        description="ایا از حذف این حساب اطمینان دارید؟"
        onRemove={() => removeAccountHandler()}
        loading={loadingRemove}
      />
    </div>
  );
};

export default CardBox;

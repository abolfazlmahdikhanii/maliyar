import { Button, Modal, toast } from "@heroui/react";
import { parseDate, parseTime } from "@internationalized/date";
import {
  BagSmileIcon,
  CalendarIcon,
  Card2Icon,
  CardSendIcon,
  CardTransferIcon,
  ClockCircleIcon,
  CloseCircleIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";

import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Category } from "../../../../data/categories";
import { formatDay } from "../../../utils/formatDate";
import type { TransactionData } from "../../../validators/transactions";
import TransactionForm from "../../transaction-form/TransactionForm";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import FormModal from "../form-modal/FormModal";
import TomanIcon from "../toman-icon/TomanIcon";
import TransactionDetailItem from "./elements/TransactionDetailItem";

type TransactionDetailModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  bank: string;
  category: Category | undefined;
  transaction: TransactionData;
  transactionId: Id<"transactions">;
};

const TransactionDetailModal = ({
  isOpen = false,
  onOpenChange,
  bank,
  category,
  transactionId,
  transaction,
}: TransactionDetailModalProps) => {
  const remove = useMutation(api.transactions.remove);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  const [isOpenModalTransaction, setIsOpenModalTransaction] =
    useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [loadingRemove, setLoadingRemove] = useState<boolean>(false);

  const removeTransactionHandler = async () => {
    if (loadingRemove) return;
    setLoadingRemove(true);
    try {
      await remove({ id: transactionId });
      toast.success("تراکنش با موفقیت حذف شد");
      setIsShowDelete(false);
      onOpenChange();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در حذف تراکنش!",
      );
    } finally {
      setLoadingRemove(false);
    }
  };
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-135 box-modal">
              <Modal.Header className="flex items-center justify-between  flex-row ">
                <Modal.Heading>جزییات تراکنش</Modal.Heading>
                <Button isIconOnly variant="ghost"  slot={"close"}>
                 <CloseCircleIcon size={"25px"}  />
                </Button>
              </Modal.Header>

              <Modal.Body>
                <div className="flex items-center flex-col mt-3">
                  <div className="w-19 h-19 grid rounded-full place-content-center bg-secondary">
                    {category ? (
                      <category.icon size={33} />
                    ) : (
                      <BagSmileIcon size={33} />
                    )}
                  </div>
                  <p className="text-xl text-white font-semibold mt-4">
                    {transaction.title || category?.label}
                  </p>
                  <p
                    className={`${transaction.type === "income" ? "text-primary" : "text-[#f06060]"} font-semibold text-[30px] flex items-center gap-x-1 mt-3`}
                  >
                    {transaction.amount?.toLocaleString()}{" "}
                    <TomanIcon width="22" height="22" />
                  </p>
                </div>
                <div className="mt-7 mx-2">
                  <TransactionDetailItem
                    title="حساب"
                    value={bank}
                    icon={Card2Icon}
                  />
                  <TransactionDetailItem
                    title="نوع"
                    value={transaction.type === "income" ? "درآمد" : "هزینه"}
                    icon={CardTransferIcon}
                    style={
                      transaction.type === "income"
                        ? "text-primary"
                        : "text-[#f06060]"
                    }
                  />
                  <TransactionDetailItem
                    title="نوع پرداخت"
                    value={
                      transaction.paymentMethod === "card"
                        ? "کارت بانکی"
                        : "نقدی"
                    }
                    icon={CardSendIcon}
                  />
                  <TransactionDetailItem
                    title="تاریخ"
                    value={
                      transaction.date
                        ? formatDay(transaction.date) || ""
                        : "__"
                    }
                    icon={CalendarIcon}
                  />
                  <TransactionDetailItem
                    title="ساعت"
                    value={transaction.time ?? "__"}
                    icon={ClockCircleIcon}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="pb-1 space-x-2">
                <Button
                  variant="outline"
                  className="h-13 rounded-xl w-1/2 text-base"
                  onClick={() => setIsOpenModalTransaction(true)}
                >
                  ویرایش <Pen2Icon />
                </Button>
                <Button
                  variant="danger-soft"
                  className="h-13 rounded-xl w-1/2 text-base"

                  onClick={() => {
                    setIsShowDelete(true);
                  }}
                >
                  حذف <TrashBin2Icon />
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف تراکنش"
        description="ایا از حذف این تراکنش اطمینان دارید؟"
        onRemove={() => removeTransactionHandler()}
        loading={loadingRemove}
      />
      <FormModal
        title="ویرایش تراکنش"
        isOpen={isOpenModalTransaction}
        onOpenChange={() => setIsOpenModalTransaction(false)}
        btnText="ثبت تراکنش"
        formId="transaction-edit-form"
        loading={loadingForm}
      >
        <TransactionForm
          key={transactionId}
          formId="transaction-edit-form"
          loading={loadingForm}
          onLoadingChange={setLoadingForm}
          onSuccess={() => setIsOpenModalTransaction(false)}
          detail={{
            type: transaction.type,
            amount: transaction.amount,
            title: transaction.title,
            category,
            transactionId,
            paymentMethod: transaction.paymentMethod,
            date: transaction.date ? parseDate(transaction.date) : null,
            time: transaction.time ? parseTime(transaction.time) : null,
            note: transaction.note,
            accountId: transaction.accountId,
          }}
        />
      </FormModal>
    </>
  );
};

export default TransactionDetailModal;

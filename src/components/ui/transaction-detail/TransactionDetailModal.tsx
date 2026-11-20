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
          <Modal.Container className="p-0! sm:p-4!">
            <Modal.Dialog className="box-modal w-full! max-w-none! rounded-b-none sm:max-w-135! sm:rounded-b-2xl">
              <Modal.Header className="flex flex-row items-center justify-between">
                <Modal.Heading>جزییات تراکنش</Modal.Heading>
                <Button isIconOnly variant="ghost" slot="close">
                  <CloseCircleIcon size="25px" />
                </Button>
              </Modal.Header>

              <Modal.Body>
                <div className="mt-2 flex flex-col items-center sm:mt-3">
                  <div className="grid size-16 place-content-center rounded-full bg-secondary sm:size-19">
                    {category ? (
                      <category.icon size={30} />
                    ) : (
                      <BagSmileIcon size={30} />
                    )}
                  </div>
                  <p className="mt-3 max-w-full truncate text-lg font-semibold text-white sm:mt-4 sm:text-xl">
                    {transaction.title || category?.label}
                  </p>
                  <p
                    className={`${
                      transaction.type === "income"
                        ? "text-primary"
                        : "text-[#f06060]"
                    } mt-2 flex items-center gap-x-1 text-2xl font-semibold sm:mt-3 sm:text-[30px]`}
                  >
                    {transaction.amount?.toLocaleString()}
                    <TomanIcon width="22" height="22" />
                  </p>
                </div>

                <div className="mx-0 mt-5 sm:mx-2 sm:mt-7">
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

                {transaction.note && (
                  <div className="mx-0 mb-2 mt-2 rounded-xl border-2 border-secondary bg-secondary/30 px-3.5 py-3.5 sm:mx-2 sm:px-4 sm:py-4">
                    <p className="mb-1.5 text-xs text-muted">توضیحات</p>
                    <p className="max-h-28 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-[1.9] text-neutral-200">
                      {transaction.note}
                    </p>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="gap-2 pb-1">
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-xl text-base sm:h-13"
                  onPress={() => setIsOpenModalTransaction(true)}
                >
                  ویرایش <Pen2Icon />
                </Button>
                <Button
                  variant="danger-soft"
                  className="h-12 flex-1 rounded-xl text-base sm:h-13"
                  onPress={() => {
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

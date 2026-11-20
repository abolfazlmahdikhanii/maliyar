import { Button, Modal, toast } from "@heroui/react";
import {
  CalendarIcon,
  Card2Icon,
  CloseCircleIcon,
  DocumentIcon,
  InfoCircleIcon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { getBankName } from "../../../utils/bankDetector";
import { getDuesStatus } from "../../../utils/duesStatus";
import { formatDate } from "../../../utils/formatDate";
import type { Dues } from "../../dues-box/DuesBox";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import DuesStatus from "../dues-status/DuesStatus";
import Stepper from "../stepper/Stepper";
import TomanIcon from "../toman-icon/TomanIcon";
import PayDue from "./elements/pay-due/PayDue";

type DuesDetailModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  detail: Dues;
};

const DuesDetailModal = ({
  isOpen = false,
  onOpenChange,
  detail,
}: DuesDetailModalProps) => {
  const remove = useMutation(api.dues.remove);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  const [loadingRemove, setLoadingRemove] = useState<boolean>(false);

  const removeDueHandler = async () => {
    if (loadingRemove) return;
    setLoadingRemove(true);
    try {
      await remove({ id: detail._id });
      toast.success(
        `${detail?.type === "claim" ? "طلب" : "بدهی"} با موفقیت حذف شد`,
      );
      setIsShowDelete(false);
      onOpenChange();
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : `خطا در حذف ${detail?.type === "claim" ? "طلب" : "بدهی"}!`,
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
                <Modal.Heading>
                  جزییات {detail?.type === "claim" ? "طلب" : "بدهی"}
                </Modal.Heading>
                <Button isIconOnly variant="outline" size="sm" slot="close">
                  <CloseCircleIcon size="25px" />
                </Button>
              </Modal.Header>

              <Modal.Body>
                <div className="box-date mt-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border font-semibold ${
                        detail?.type === "claim"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-[#f06060] bg-[#f060601a] text-[#f06060]"
                      }`}
                    >
                      <p className="text-lg">
                        {detail?.party?.charAt(0) ?? "U"}
                      </p>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <p className="truncate text-base font-semibold">
                        {detail?.party ?? ""}
                      </p>
                      <div className="shrink-0 whitespace-nowrap">
                        <DuesStatus
                          status={getDuesStatus({
                            status: detail?.status,
                            dueDate: detail?.dueDate,
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-secondary pt-4">
                    <div className="min-w-0">
                      <p className="mb-1.5 text-xs text-neutral-400">مبلغ</p>
                      <p
                        className={`${
                          detail?.type === "debt"
                            ? "text-[#ff6b6b]"
                            : "text-primary"
                        } flex items-center gap-x-1 text-3xl font-semibold leading-none`}
                      >
                        {detail?.amount?.toLocaleString()}
                        <span className="text-neutral-400">
                          <TomanIcon width="20" height="20" />
                        </span>
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs ${
                        detail?.type === "claim"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-[#f06060]/40 bg-[#f060601a] text-[#f06060]"
                      }`}
                    >
                      {detail?.type === "claim" ? "طلب من" : "بدهی من"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-secondary overflow-hidden rounded-xl border border-secondary bg-[#202025]/60">
                  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="flex shrink-0 items-center gap-2.5 text-neutral-400">
                      <div className="grid size-8 place-items-center rounded-lg border border-secondary bg-[#202025]">
                        <Card2Icon size={18} />
                      </div>
                      <p className="text-sm">حساب</p>
                    </div>
                    <p className="min-w-0 truncate text-sm text-neutral-200">
                      {detail.bank && detail.bank !== "unknown"
                        ? getBankName(detail.bank)
                        : "نامشخص"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="flex shrink-0 items-center gap-2.5 text-neutral-400">
                      <div className="grid size-8 place-items-center rounded-lg border border-secondary bg-[#202025]">
                        <CalendarIcon size={18} />
                      </div>
                      <p className="text-sm">سررسید</p>
                    </div>
                    <p className="text-sm text-neutral-200">
                      {detail?.dueDate && formatDate(detail?.dueDate)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-3 px-3.5 py-3">
                    <div className="flex shrink-0 items-center gap-2.5 text-neutral-400">
                      <div className="grid size-8 place-items-center rounded-lg border border-secondary bg-[#202025]">
                        <DocumentIcon size={18} />
                      </div>
                      <p className="text-sm">علت</p>
                    </div>
                    <p className="min-w-0 wrap-break-word text-left text-sm text-neutral-200">
                      {detail?.reason || "—"}
                    </p>
                  </div>
                </div>

                <div className="mx-1 mt-6">
                  <Stepper status={detail?.status ?? "open"} />
                  <div className="flex gap-x-1.25 pb-2 pt-6 text-neutral-500">
                    <InfoCircleIcon size={15} className="shrink-0" />
                    <p className="text-[11.5px] leading-[1.7]">
                      با ثبت پرداخت، این مورد به «تسویه‌شده‌ها» منتقل و تراکنشی
                      معادل آن در حساب «بانک مورد نظر» ثبت می‌شود
                    </p>
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="gap-2 pb-1">
                {detail?.status === "open" && (
                  <PayDue
                    key={detail._id}
                    dueId={detail._id}
                    style="h-12 flex-1 rounded-xl text-base bg-primary text-black sm:h-13"
                  />
                )}
                <Button
                  variant="danger-soft"
                  className="h-12 flex-1 rounded-xl text-base sm:h-13"
                  slot="close"
                  onPress={() => setIsShowDelete(true)}
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
        description={
          detail.status === "paid"
            ? "تراکنش پرداخت این مورد هم حذف می‌شود و موجودی حساب به حالت قبل برمی‌گردد."
            : " حذف، غیرقابل بازگشت است و این مورد از همه لیست‌ها پاک می‌شود."
        }
        loading={loadingRemove}
        onRemove={removeDueHandler}
      />
    </>
  );
};

export default DuesDetailModal;

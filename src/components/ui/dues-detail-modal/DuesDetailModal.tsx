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
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-135 box-modal">
              <Modal.Header className="flex items-center justify-between  flex-row">
                <Modal.Heading>
                  جزییات {detail?.type === "claim" ? "طلب" : "بدهی"}
                </Modal.Heading>
                <Button isIconOnly variant="outline" size="sm" slot={"close"}>
                  <CloseCircleIcon size={"25px"} />
                </Button>
              </Modal.Header>

              <Modal.Body>
                <div className="box-date rounded-xl  mt-4 mx-2">
                  <div className="flex gap-3.5">
                    <div
                      className={`rounded-2xl font-semibold grid place-items-center ${detail?.type === "claim" ? "bg-primary/15 border border-primary text-primary" : "bg-[#f060601a] text-[#f06060] border border-[#f06060]"} w-15 h-13`}
                    >
                      <p className="text-lg">
                        {detail?.party?.charAt(0) ?? "U"}
                      </p>
                    </div>
                    <div className="flex justify-between w-full ">
                      <div className="flex flex-col gap-2.5">
                        <p className="font-semibold text-[17px]">
                          {detail?.party ?? ""}
                        </p>

                        <div className="w-fit">
                          <DuesStatus
                            status={getDuesStatus({
                              status: detail?.status,
                              dueDate: detail?.dueDate,
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <p
                          className={`${detail?.type === "debt" ? "text-[#ff6b6b]" : "text-primary"} font-semibold text-[26px] flex items-center gap-x-1`}
                        >
                          {detail?.amount?.toLocaleString()}{" "}
                          <span className="text-neutral-400">
                            <TomanIcon width="18" height="18" />
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-7 mx-2">
                  <div className=" py-4 px-4 border-b border-secondary">
                    <div className="flex gap-x-2.5 text-neutral-400 ">
                      <div className="w-9.5 h-9.5 bg-[#202025] border border-secondary rounded-xl grid place-items-center">
                        <Card2Icon size={22} />
                      </div>
                      <div className="flex flex-col gap-y-1.5">
                        <p className="text-sm">حساب</p>
                        <p className="text-[15px] text-neutral-200">
                          {detail.bank && detail.bank !== "unknown"
                            ? getBankName(detail.bank)
                            : "نامشخص"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className=" py-4 px-4 border-b border-secondary">
                    <div className="flex gap-x-2.5 text-neutral-400 ">
                      <div className="w-9.5 h-9.5 bg-[#202025] border border-secondary rounded-xl grid place-items-center">
                        <CalendarIcon size={21} />
                      </div>
                      <div className="flex flex-col gap-y-1.5">
                        <p className="text-sm">سررسید</p>
                        <p className="text-[15px] text-neutral-200">
                          {detail?.dueDate && formatDate(detail?.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className=" py-4 px-4 ">
                    <div className="flex gap-x-2.5 text-neutral-400 ">
                      <div className="w-9.5 h-9.5 bg-[#202025] border border-secondary rounded-xl grid place-items-center">
                        <DocumentIcon size={21} />
                      </div>
                      <div className="flex flex-col gap-y-1.5">
                        <p className="text-sm">علت</p>
                        <p className="text-[15px] text-neutral-200">
                          {detail?.reason ?? ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-7 mx-5">
                  <Stepper status={detail?.status ?? "open"} />
                  <div className="flex  gap-x-1.25 text-neutral-500 pt-8 pb-2">
                    <InfoCircleIcon size={15} />
                    <p className="text-[11.5px] leading-[1.7]">
                      با ثبت پرداخت، این مورد به «تسویه‌شده‌ها» منتقل و تراکنشی
                      معادل آن در حساب «بانک مورد نظر» ثبت می‌شود
                    </p>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="pb-1 space-x-2">
                {detail?.status === "open" && (
                  <PayDue
                    key={detail._id}
                    dueId={detail._id}
                    style="h-13 rounded-xl w-1/2 text-base bg-primary text-black"
                  />
                )}
                <Button
                  variant="danger-soft"
                  className="h-13 rounded-xl w-1/2 text-base"
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

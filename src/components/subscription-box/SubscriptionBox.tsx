import { Button, Dropdown, Label, ProgressBar } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  CheckReadIcon,
  PauseIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useState } from "react";
import FormModal from "../ui/form-modal/FormModal";
import SubscriptionForm from "../subscription-form/SubscriptionForm";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";

type SubscriptionBoxProps = {
  title?: string;
  amount?: number;
  periodLabel?: string;
  nextPayment?: string;
  progress?: number;
  isPaid?: boolean;
};

const SubscriptionBox = ({
  title = "Netflix",
  amount = 2490000,
  periodLabel = "ماهانه",
  nextPayment = "۱۴۰۲/۰۹/۱۲",
  progress = 60,
  isPaid = true,
}: SubscriptionBoxProps) => {
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
    const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  return (
    <div className="w-full box rounded-2xl">
      <div className="flex items-center justify-between">
        {/* right */}
        <div className="flex gap-x-3">
          <div className="w-12 h-12 rounded-xl bg-red-500 grid place-items-center">
            <span className="text-xl font-semibold ">{title.charAt(0)}</span>
          </div>
          <div className="space-y-0.75">
            <p className="font-semibold text-lg ">نماوا</p>
            <p className="text-xs text-muted">موسیقی . ماهانه . بانک ملت</p>
          </div>
        </div>
        {/* left */}
        <div className="space-y-0.75">
          <p className="text-xl font-semibold">{amount.toLocaleString()}</p>
          <p className="text-muted text-xs text-left">تومان / ماهانه</p>
        </div>
      </div>
      <div className="box-date rounded-2xl mt-4">
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            پرداخت بعدی:{" "}
            <span className="mr-0.5 text-white font-semibold">1 مهر 1405</span>
          </p>
          <div
            className={`py-1.5 px-2.5 border text-xs rounded-xl bg-[rgba(255,184,108,.12)] text-[#ffb86c] border-[#ffb86c]`}
          >
            4 روز مانده
          </div>
        </div>
        <div className="mt-4 ">
          <ProgressBar
            aria-label="Loading progress"
            className="w-full"
            value={progress}
          >
            <ProgressBar.Track className="bg-secondary">
              <ProgressBar.Fill
                className="right-0 "
                style={{ background: progress > 100 ? "#e85050" : "#dbb848" }}
              />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      </div>
      <section className="flex items-center gap-x-4 mt-4.5">
        <Button className="h-13 rounded-xl w-full text-base bg-primary text-black">
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
                if (key === "edit") setIsOpenEditModal(true);
                if (key === "delete") setIsShowDelete(true);
                // if (key === "factor") setIsOpenFactorModal(true);
              }}
              >
                <Dropdown.Item id="stop" textValue="stop">
                  <Label className="flex items-center gap-x-2.5">
                    <PauseIcon size={16} />
                    توقف
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
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ذخیره تغییرات"
      >
        <SubscriptionForm />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف اشتراک"
        description="ایا از حذف این اشتراک اطمینان دارید؟"
      />
    </div>
  );
};

export default SubscriptionBox;

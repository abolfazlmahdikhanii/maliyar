import { Button, Dropdown, Label } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  CalendarIcon,
  CardholderIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useState } from "react";
import GoalForm from "../goal-form/GoalForm";
import CircleProgress from "../ui/circle-progress/CircleProgress";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FormModal from "../ui/form-modal/FormModal";

const FinanceGoalBox = () => {
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  return (
    <div className="box rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
          <p className="font-semibold truncate text-neutral-100">
            سفر به ترکیه
          </p>
        </div>
        <div className="text-sm text-primary bg-primary/15 px-3.25 py-0.75 rounded-full text-center border-primary border  ">
          16%
        </div>
      </div>
      <div className="mt-2.5">
        <CircleProgress
          progress={75}
          size={430}
          strokeWidth={15}
          trackColor="text-secondary"
          progressColor="text-primary"
        />
      </div>
      <div className="mt-2 py-2 text-sm px-3.75 mx-auto rounded-xl bg-secondary border-secondary border flex items-center gap-x-1.5 w-fit">
        <CalendarIcon size={17} />
        <p>240 روز مانده</p>
      </div>
      {/* <div className="mt-2.75 py-2 text-sm px-3.75 mx-auto rounded-xl bg-secondary border border-secondary text-muted flex items-center gap-x-1.5 w-fit">
        <InfiniteIcon size={16} />
        <p> بدون مهلت</p>
      </div> */}
      <section className="flex items-center gap-x-4 mt-6.5">
        <Button className="h-13 rounded-xl w-full text-base bg-primary text-black">
          <CardholderIcon size={20} />
          افزودن پس انداز
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

      {/* <section className="flex items-center gap-x-3.5 mt-6.5 py-3.75 px-3.5 bg-primary/15 border border-primary text-primary rounded-xl">
        <ConfettiIcon size={29} />
        <div className="flex flex-col gap-y-1.5">
          <p className="font-semibold">هدف تکمیل شد - تبریک !</p>
          <p className="text-xs text-muted">۶۰٬۰۰۰٬۰۰۰ تومان پس‌انداز شد · کارت سامان</p>
        </div>

      </section> */}

      <FormModal
        title="ویرایش هدف"
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ذخیره تغییرات"
      >
        <GoalForm />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف هدف"
        description="ایا از حذف این هدف اطمینان دارید؟"
      />
    </div>
  );
};

export default FinanceGoalBox;

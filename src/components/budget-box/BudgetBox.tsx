import { Button, Dropdown, Label, ProgressBar } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import { Pen2Icon, TrashBin2Icon } from "@solar-icons/react/outline";
import { useMemo, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import BudgetForm from "../budget-form/BudgetForm";
import type { Category } from "../ui/categories/Categories";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FormModal from "../ui/form-modal/FormModal";
import InputPrice from "../ui/input-price/InputPrice";

type BudgetBoxProps = {
  category: Category,
  limitPrice: number,
  usedPrice: number,
};
const BudgetBox = ({ category, limitPrice, usedPrice }: BudgetBoxProps) => {
  const [isOpenUsedPriceModal, setIsOpenUsedPriceModal] = useState<boolean>(
    false,
  );
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);

  const [usedPriceValue, setUsedPriceValue] = useState<string>(
    usedPrice.toString() || "0",
  );

  const [isShowDelete,setIsShowDelete]=useState<boolean>(false)


  const budgetPercent = useMemo(() => {
    if (!limitPrice) return 0;
    return Math.min(100, Math.floor((usedPrice / limitPrice) * 100));
  }, [usedPrice, limitPrice]);
  let budgetBg: { progressBg: string; percentBg: string } | null = null;

  if (budgetPercent < 60)
    budgetBg = { progressBg: "#9fe870", percentBg: "rgba(159, 232, 112,0.1)" };
  else if (budgetPercent > 60 && budgetPercent <= 85)
    budgetBg = { progressBg: "#e8c44c", percentBg: "rgba(232, 196, 76,0.1)" };
  else budgetBg = { progressBg: "#e85050", percentBg: "rgba(232, 80, 80,0.1)" };

  return (
    <div className="box rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 min-w-12 min-h-12 grid rounded-full place-content-center `}
            style={{ background: category.bg, color: category.color }}
          >
            <category.icon size={23} />
          </div>
          <p className={`text-[17px] whitespace-nowrap`}>{category.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-0.75 text-sm grid place-content-center rounded-lg "
            style={{
              color: budgetBg.progressBg,
              background: budgetBg.percentBg,
            }}
          >
            {budgetPercent}%
          </div>
          <div className="relative">
            <Dropdown>
              <Button variant="outline" isIconOnly className={" w-8 h-8"}>
                <MenuDotsBoldIcon className="rotate-90" />
              </Button>
              <Dropdown.Popover className={"box-modal-2"}>
                <Dropdown.Menu
                  onAction={(key) => {
                    if(key==="edit") setIsOpenEditModal(true)
                    if(key==="delete") setIsShowDelete(true)

                  }}
                >
                  <Dropdown.Item id="edit" textValue="Edit">
                    <Label className="flex items-center gap-x-2.5">
                      <Pen2Icon size={18} />
                      ویرایش
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
      <div className="mt-4 px-2">
        <ProgressBar
          aria-label="Loading progress"
          className="w-full"
          value={budgetPercent}
        >
          <ProgressBar.Track className="bg-secondary">
            <ProgressBar.Fill
              className="right-0 "
              style={{ background: budgetBg.progressBg }}
            />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
      <div className="mt-5.5 grid grid-cols-2 gap-4">
        <div className="box-date flex flex-col gap-4 rounded-xl">
          <p className="text-xs text-muted">هزینه شده</p>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              isIconOnly
              className={" w-8 h-8"}
              onClick={() => setIsOpenUsedPriceModal(true)}
            >
              <Pen2Icon size={14} />
            </Button>
            <p className="text-lg font-semibold text-[#e85050] self-end">
              {formatNumber(usedPriceValue) ||
                formatNumber(usedPrice.toString())}
            </p>
          </div>
        </div>
        <div className="box-date flex flex-col gap-4 rounded-xl">
          <p className="text-xs text-muted">سقف بودجه</p>
          <p className="text-lg font-semibold  self-end">
            {formatNumber(limitPrice.toString())}
          </p>
        </div>
      </div>
      <FormModal
        title="هزینه استفاده شده"
        isOpen={isOpenUsedPriceModal}
        onOpenChange={() => setIsOpenUsedPriceModal(false)}
        btnText="ثبت هزینه"
      >
        <InputPrice price={usedPriceValue} setPrice={setUsedPriceValue} />
      </FormModal>
      <FormModal
        title="ویرایش بودجه"
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ویرایش بودجه"
      >
        <BudgetForm />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف بودجه"
        description="ایا از حذف این بودجه اطمینان دارید؟"
      />
    </div>
  );
};

export default BudgetBox;

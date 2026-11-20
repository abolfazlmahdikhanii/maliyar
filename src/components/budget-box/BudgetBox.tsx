import { Button, Dropdown, Label, ProgressBar, toast } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  BagSmileIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getCategory } from "../../../data/categories";
import { formatNumber } from "../../utils/formatNumber";
import BudgetForm from "../budget-form/BudgetForm";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FormModal from "../ui/form-modal/FormModal";

type BudgetBoxProps = {
  categoryId: string;
  limit: number;
  used: number;
  _id: Id<"budgets">;
};

const BudgetBox = ({ categoryId, limit, used, _id }: BudgetBoxProps) => {
  const remove = useMutation(api.budgets.remove);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [isShowDelete, setIsShowDelete] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [loadingRemove, setLoadingRemove] = useState<boolean>(false);

  const category = useMemo(() => getCategory(categoryId), [categoryId]);

  const removeBudgetHandler = async () => {
    if (loadingRemove) return;
    setLoadingRemove(true);
    try {
      await remove({ id: _id });
      toast.success("بودجه با موفقیت حذف شد");
      setIsShowDelete(false);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در حذف بودجه!",
      );
    } finally {
      setLoadingRemove(false);
    }
  };

  const budgetPercent = useMemo(() => {
    if (!limit) return 0;
    return Math.min(100, Math.floor((used / limit) * 100));
  }, [used, limit]);

  let budgetBg: { progressBg: string; percentBg: string } | null = null;

  if (budgetPercent <= 60)
    budgetBg = { progressBg: "#9fe870", percentBg: "rgba(159, 232, 112,0.1)" };
  else if (budgetPercent > 60 && budgetPercent <= 85)
    budgetBg = { progressBg: "#dbb848", percentBg: "rgba(232, 196, 76,0.1)" };
  else budgetBg = { progressBg: "#e85050", percentBg: "rgba(232, 80, 80,0.1)" };

  return (
    <div className="box min-w-0 rounded-2xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid size-11 min-h-11 min-w-11 shrink-0 place-content-center rounded-full sm:size-12 sm:min-h-12 sm:min-w-12"
            style={{ background: category?.bg, color: category?.color }}
          >
            {category ? (
              <category.icon size={24} />
            ) : (
              <BagSmileIcon size={24} />
            )}
          </div>
          <p className="truncate text-base sm:text-[17px]">{category?.label}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="grid place-content-center rounded-lg px-2.5 py-0.75 text-sm"
            style={{
              color: budgetBg.progressBg,
              background: budgetBg.percentBg,
            }}
          >
            {budgetPercent}%
          </div>
          <div className="relative">
            <Dropdown>
              <Button variant="outline" isIconOnly className="size-8">
                <MenuDotsBoldIcon className="rotate-90" />
              </Button>
              <Dropdown.Popover className="box-modal-2 w-60 md:w-auto ml-3 md:ml-0">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "edit") setIsOpenEditModal(true);
                    if (key === "delete") setIsShowDelete(true);
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

      <div className="mt-4 px-1 sm:px-2">
        <ProgressBar
          aria-label="Loading progress"
          className="w-full"
          value={budgetPercent}
        >
          <ProgressBar.Track className="bg-secondary">
            <ProgressBar.Fill
              className="right-0"
              style={{ background: budgetBg.progressBg }}
            />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5.5 sm:gap-4">
        <div className="box-date flex min-w-0 flex-col gap-3 rounded-xl sm:gap-4">
          <p className="text-xs text-muted">هزینه شده</p>
          <p className="self-end truncate text-base font-semibold text-[#e85050] sm:text-lg">
            {formatNumber(used.toString())}
          </p>
        </div>
        <div className="box-date flex min-w-0 flex-col gap-3 rounded-xl sm:gap-4">
          <p className="text-xs text-muted">سقف بودجه</p>
          <p className="self-end truncate text-base font-semibold sm:text-lg">
            {formatNumber(limit.toString())}
          </p>
        </div>
      </div>

      <FormModal
        title="ویرایش بودجه"
        isOpen={isOpenEditModal}
        onOpenChange={() => setIsOpenEditModal(false)}
        btnText="ویرایش بودجه"
        formId="edit-budget-form"
        loading={loadingForm}
      >
        <BudgetForm
          formId="edit-budget-form"
          detail={{ categoryId, limit, budgetId: _id }}
          loading={loadingForm}
          onLoadingChange={setLoadingForm}
          onSuccess={() => setIsOpenEditModal(false)}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={isShowDelete}
        onChangeShowDelete={() => setIsShowDelete(false)}
        title="حذف بودجه"
        description="ایا از حذف این بودجه اطمینان دارید؟"
        loading={loadingRemove}
        onRemove={removeBudgetHandler}
      />
    </div>
  );
};

export default BudgetBox;
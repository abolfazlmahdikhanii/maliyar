import { Button, Dropdown, Label, toast } from "@heroui/react";
import { MenuDotsBoldIcon } from "@solar-icons/react";
import {
  CalendarIcon,
  CardholderIcon,
  ConfettiIcon,
  InfiniteIcon,
  Pen2Icon,
  TrashBin2Icon,
} from "@solar-icons/react/outline";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { getGoalCategory } from "../../../data/goalCategories";
import type { Goal } from "../../page/finance-goal/FinanceGoal";
import { getBankName } from "../../utils/bankDetector";
import { daysLabel, daysUntil } from "../../utils/dateMath";
import GoalForm from "../goal-form/GoalForm";
import CircleProgress from "../ui/circle-progress/CircleProgress";
import DeleteDialog from "../ui/delete-dialog/DeleteDialog";
import FormModal from "../ui/form-modal/FormModal";
import AddSavingsForm from "./elements/AddSavingForm";

type Modal = "edit" | "delete" | "save" | null;
type FinanceGoalBoxProps = {
  goal: Goal;
};

const FinanceGoalBox = ({ goal }: FinanceGoalBoxProps) => {
  const remove = useMutation(api.goals.remove);

  const [modal, setModal] = useState<Modal | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const category = getGoalCategory(goal.categoryId);
  const bankName = goal.bank ? getBankName(goal.bank) : null;
  const days = goal.deadline ? daysUntil(goal.deadline) : null;

  const removeHandler = async () => {
    if (isLoadingDelete) return;
    setIsLoadingDelete(true);
    try {
      await remove({ id: goal._id });
      toast.success("هدف با موفقیت حذف شد");
      setModal(null);
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در حذف هدف!",
      );
    } finally {
      setIsLoadingDelete(false);
    }
  };
  return (
    <div className="box rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full "
            style={{ backgroundColor: category.bg }}
          ></span>
          <p className="font-semibold truncate text-neutral-100">
            {goal.title ? goal.title : category.label}
          </p>
        </div>
        <div className="text-sm text-primary bg-primary/15 px-3.25 py-0.75 rounded-full text-center border-primary border  ">
          {goal.percent}%
        </div>
      </div>
      <div className="flex flex-col h-[93%] justify-between">
        <div>
          <div className="mt-2.5">
            <CircleProgress
              progress={goal.percent}
              size={430}
              strokeWidth={15}
              trackColor="text-secondary"
              progressColor="text-primary"
              savedAmount={goal.savedAmount}
              targetAmount={goal.targetAmount}
            />
          </div>
          {goal.deadline ? (
            <div className="mt-2 py-2 text-sm px-3.75 mx-auto rounded-xl bg-secondary border-secondary border flex items-center gap-x-1.5 w-fit">
              <CalendarIcon size={17} />
              <p>{daysLabel(Number(days))}</p>
            </div>
          ) : (
            <div className="mt-2.75 py-2 text-sm px-3.75 mx-auto rounded-xl bg-secondary border border-secondary text-muted flex items-center gap-x-1.5 w-fit">
              <InfiniteIcon size={16} />
              <p> بدون مهلت</p>
            </div>
          )}
        </div>

        {!goal.completed ? (
          <section className="flex items-center gap-x-4 mt-6.5 justify-self-end">
            <Button
              className="h-13 rounded-xl w-full text-base bg-primary text-black"
              isDisabled={goal.completed}
              onPress={() => setModal("save")}
            >
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
                <Dropdown.Popover className={"box-modal-2 w-60 md:w-auto ml-3 md:ml-0"}>
                  <Dropdown.Menu
                    onAction={(key) => {
                      if (key === "edit") setModal("edit");
                      if (key === "delete") setModal("delete");
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
          </section>
        ) : (
          <section className="flex items-center gap-x-3.5 mt-6.5 py-3.75 px-3.5 bg-primary/15 border border-primary text-primary rounded-xl">
            <ConfettiIcon size={29} />
            <div className="flex flex-col gap-y-1.5">
              <p className="font-semibold">هدف تکمیل شد - تبریک !</p>
              <p className="text-xs text-muted">
                {goal.targetAmount?.toLocaleString() ?? 0} تومان پس‌انداز شد ·{" "}
                {bankName}
              </p>
            </div>
          </section>
        )}
      </div>
      <FormModal
        title="افزودن پس انداز"
        isOpen={modal === "save"}
        onOpenChange={() => setModal(null)}
        btnText="ثبت پس‌انداز"
        formId={`save-goal-${goal._id}`}
        loading={isLoadingSave}
      >
        <AddSavingsForm
          goal={goal}
          formId={`save-goal-${goal._id}`}
          loading={isLoadingSave}
          onLoadingChange={setIsLoadingSave}
          onSuccess={() => setModal(null)}
        />
      </FormModal>
      <FormModal
        title="ویرایش هدف"
        isOpen={modal === "edit"}
        onOpenChange={() => setModal(null)}
        btnText="ذخیره تغییرات"
        formId="edit-goal-form"
        loading={isLoadingEdit}
      >
        <GoalForm
          formId="edit-goal-form"
          onSuccess={() => setModal(null)}
          loading={isLoadingEdit}
          onLoadingChange={setIsLoadingEdit}
          detail={goal}
        />
      </FormModal>

      <DeleteDialog
        isShowDelete={modal === "delete"}
        onChangeShowDelete={() => setModal(null)}
        title="حذف هدف"
        description="ایا از حذف این هدف اطمینان دارید؟"
        loading={isLoadingDelete}
        onRemove={removeHandler}
      />
    </div>
  );
};

export default FinanceGoalBox;

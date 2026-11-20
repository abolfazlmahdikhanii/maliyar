import { Button, ProgressBar } from "@heroui/react";
import { AltArrowDownIcon, AltArrowUpIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import type { Goal } from "../../page/finance-goal/FinanceGoal";
import CircleProgress from "../ui/circle-progress/CircleProgress";

type GoalItemProps = {
  goal: Goal;
};

const GoalItem = ({ goal }: GoalItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className="min-w-0 cursor-pointer rounded-2xl bg-secondary py-3.5 pl-3.5 pr-4 transition-all duration-200 sm:py-4.5 sm:pl-4.5 sm:pr-6"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm sm:text-base text-white md:text-lg">
          {goal.title}
        </p>

        {!isOpen ? (
          <div className="flex shrink-0 items-center gap-x-2.25">
            <ProgressBar
              aria-label="Loading progress"
              className="w-16 sm:w-24.5"
              value={goal.percent}
              color="danger"
            >
              <ProgressBar.Track className="bg-red-400/15">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <p className="mt-1 text-xs text-neutral-300 sm:text-[13px]">
              {goal.percent}%
            </p>
          </div>
        ) : null}

        <Button
          isIconOnly
          className={`size-6 shrink-0 rounded-full ${
            !isOpen ? "bg-secondary" : "bg-neutral-200 text-black"
          }`}
          onPress={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? (
            <AltArrowUpIcon size={14} />
          ) : (
            <AltArrowDownIcon size={14} />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="my-1">
          <CircleProgress
            progress={goal.percent}
            size={400}
            strokeWidth={15}
            trackColor="text-secondary"
            progressColor="text-[#005EFB]"
            savedAmount={goal.savedAmount}
            targetAmount={goal.targetAmount}
          />
        </div>
      )}
    </div>
  );
};

export default GoalItem;
import { Button, ScrollShadow } from "@heroui/react";
import { MentionCircleIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import GoalItem from "../goal-item/GoalItem";
import EmptyState from "../ui/empty-state/EmptyState";
import { Loader } from "../ui/loading-box/LoadingBox";

const LIMIT = 5;

type GoalBoxProps = {
  onOpenGoals?: () => void;
};

const GoalBox = ({ onOpenGoals }: GoalBoxProps) => {
  const goals = useQuery(api.goals.list);

  const recent = [...(goals ?? [])]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, LIMIT);

  return (
    <div className="relative w-full min-w-0 lg:col-span-1 lg:h-full">
      <div className="box inverted-radius h-auto! min-h-0! w-full lg:h-full!">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11.5 shrink-0 place-content-center rounded-full bg-secondary text-white">
              <MentionCircleIcon size={24} />
            </div>
            <p className="text-lg text-white sm:text-[21px]">اهداف من</p>
          </div>
        </div>

        {goals === undefined ? (
          <div className="flex min-h-48 items-center justify-center lg:h-[90%]">
            <Loader />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center lg:h-[90%]">
            <EmptyState
              compact
              kind="goals"
              title="هنوز هدفی نداری"
              action={{ label: "هدف جدید", onPress: () => onOpenGoals?.() }}
            />
          </div>
        ) : (
          <ScrollShadow
            hideScrollBar
            className="mt-6 max-h-[80%]  h-full space-y-2.5 overflow-y-auto overflow-x-hidden pb-2 lg:mt-8 lg:max-h-98.5"
          >
            {recent.map((goal) => (
              <GoalItem key={goal._id} goal={goal} />
            ))}
          </ScrollShadow>
        )}
      </div>

      <Button
        isIconOnly
        aria-label="هدف جدید"
        className="absolute left-3.5 top-1 size-13.75 rounded-full border border-secondary bg-secondary text-white"
        onPress={onOpenGoals}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
};

export default GoalBox;
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
    <div className="relative h-full w-full col-span-2 lg:col-span-1">
      <div className="box inverted-radius w-full h-full ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full text-white">
              <MentionCircleIcon size={24} />
            </div>
            <p className="text-white text-[21px]">اهداف من</p>
          </div>
        </div>

        {goals === undefined ? (
          <div className="flex items-center justify-center h-[90%]">
            <Loader />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex items-center justify-center h-[90%]">
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
            className="mt-8 pb-2 space-y-2.5 min-h-72 h-auto  lg:max-h-98.5 overflow-x-hidden"
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
        className="absolute top-1 left-3.5 bg-secondary w-13.75 h-13.75 rounded-full text-white border border-secondary"
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

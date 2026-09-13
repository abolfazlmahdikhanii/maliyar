import { Button, ScrollShadow } from "@heroui/react";
import { MentionCircleIcon } from "@solar-icons/react/outline";
import GoalItem from "../goal-item/GoalItem";

const GoalBox = () => {
  return (
    <div className="relative">
      <div className="box inverted-radius  w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11.5 h-11.5 grid place-content-center bg-secondary rounded-full  text-white">
              <MentionCircleIcon size={24} />
            </div>
            <p className="text-white text-[21px]  ">اهداف من</p>
          </div>
        </div>
        <ScrollShadow hideScrollBar className="mt-8 pb-2 space-y-2.5 max-h-98.5 overflow-x-hidden">
          <GoalItem />
          <GoalItem />
          <GoalItem />
          <GoalItem />
          <GoalItem />
          <GoalItem />
          <GoalItem />
        </ScrollShadow>
      </div>
      <Button
        isIconOnly
        className={
          " absolute top-1 left-3.5 bg-secondary w-13.75 h-13.75 rounded-full text-white border border-secondary"
        }
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

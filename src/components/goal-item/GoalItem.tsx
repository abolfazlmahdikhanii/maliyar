import { Button, ProgressBar } from "@heroui/react";
import { AltArrowDownIcon, AltArrowUpIcon } from "@solar-icons/react/outline";
import { useState } from "react";
import CircleProgress from "../ui/circle-progress/CircleProgress";

const GoalItem = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div
      className="py-4.5 pr-6 pl-4.5 rounded-2xl bg-secondary transition-all duration-200 cursor-pointer"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className="flex items-center justify-between ">
        <p className="text-lg  text-white truncate">تعطیلات</p>
        {!isOpen ? (
          <div className="flex items-center gap-x-2.25">
            <ProgressBar
              aria-label="Loading progress"
              className="w-24.5"
              value={45}
              color="danger"
            >
              <ProgressBar.Track className="bg-red-400/15">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <p className="text-neutral-300 text-[13px] mt-1">16%</p>
          </div>
        ) : null}

        <Button
          isIconOnly
          className={`w-6 h-6 rounded-full ${
            !isOpen ? "bg-secondary" : "bg-neutral-200 text-black"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
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
            progress={75}
            size={400}
            strokeWidth={15}
            trackColor="text-secondary"
            progressColor="text-[#005EFB]"
          />
        </div>
      )}
    </div>
  );
};

export default GoalItem;

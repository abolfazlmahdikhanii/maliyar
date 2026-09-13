import { CheckCircleIcon } from "@solar-icons/react/bold";

type CircleProgressProps = {
  progress: number;
  size: number;
  strokeWidth: number;
  trackColor: string;
  progressColor: string;
};
const CircleProgress = ({
  progress,
  size,
  strokeWidth,
  trackColor,
  progressColor,
}: CircleProgressProps) => {
  const validProgress = Math.min(100, Math.max(0, progress));

  const radius = 40;
  const circumference = Math.PI * radius;
  const offset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative"
        style={{ width: `${size}px`, height: `${size / 2}px` }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            stroke="currentColor"
            strokeWidth={strokeWidth / 2}
            strokeLinecap="round"
            className={trackColor}
          />
          {/* Progress Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            stroke="currentColor"
            strokeWidth={strokeWidth / 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${progressColor} transition-all duration-700 ease-out`}
            style={{
              transformOrigin: "center",
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-end justify-center pb-5">
          <div className="flex flex-col items-center justify-center ">
            <p className="font-bold text-neutral-400 mb-0.5">هدف</p>
            <p className="text-[32px] text-white font-semibold">1,200,000</p>
            <div className="flex items-center gap-x-1.5">
              <p className="text-green-500">
                <CheckCircleIcon size={15} />
              </p>
              <p className="font-bold text-neutral-400 text-sm mt-0.5">
                2,000,000 /
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleProgress;

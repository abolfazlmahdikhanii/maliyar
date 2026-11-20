import {
  AddCircleIcon,
  CheckReadIcon,
  ClockCircleIcon,
} from "@solar-icons/react/outline";

type StepperProps = { status: "open" | "paid" };

const Stepper = ({ status }: StepperProps) => {
  const isPaid = status === "paid";
  const isOpen = status === "open";

  return (
    <ol className="flex w-full items-start">
      <li className="flex shrink-0 flex-col items-center gap-2 text-xs font-semibold text-white">
        <span className="grid size-9 place-items-center rounded-full border border-transparent bg-primary text-black">
          <AddCircleIcon size={21} />
        </span>
        ثبت
      </li>

      <div className="mt-4.25 h-0.5 flex-1 bg-primary" />

      <li
        className={`flex shrink-0 flex-col items-center gap-2 text-xs ${
          isPaid ? "font-semibold text-white" : "text-muted"
        }`}
      >
        <span
          className={`grid size-9 place-items-center rounded-full border ${
            isOpen
              ? "border-primary bg-[#202025] text-primary"
              : "border-transparent bg-primary text-black"
          }`}
        >
          <ClockCircleIcon size={21} />
        </span>
        در جریان
      </li>

      <div
        className={`mt-4.25 h-0.5 flex-1 ${isPaid ? "bg-primary" : "bg-secondary"}`}
      />

      <li
        className={`flex shrink-0 flex-col items-center gap-2 text-xs ${
          isPaid ? "font-semibold text-white" : "text-muted"
        }`}
      >
        <span
          className={`grid size-9 place-items-center rounded-full border ${
            isPaid
              ? "border-primary bg-primary text-black"
              : "border-secondary bg-[#202025]"
          }`}
        >
          <CheckReadIcon size={21} />
        </span>
        تسویه
      </li>
    </ol>
  );
};

export default Stepper;

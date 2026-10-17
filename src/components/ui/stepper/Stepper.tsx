import {
  AddCircleIcon,
  CheckReadIcon,
  ClockCircleIcon,
} from "@solar-icons/react/outline";

type StepperProps = { status: "open" | "paid" };
const Stepper = ({ status }: StepperProps) => {
  return (
    <ol className="flex items-center justify-center w-full text-xs text-gray-900 font-medium sm:text-base ">
      <li className="flex w-full relative text-white text-center font-semibold text-xs    after:w-full after:h-0.5  after:bg-primary after:block after:absolute lg:after:top-5 after:-left-1">
        <div className="block whitespace-nowrap z-10">
          <span className="w-6 h-6 bg-primary border border-transparent rounded-full grid place-items-center mx-auto mb-2.5 text-xs text-black lg:w-9 lg:h-9">
            <AddCircleIcon size={21} />
          </span>{" "}
          ثبت
        </div>
      </li>
      <li className={`flex w-full relative text-muted text-center   after:w-full after:h-0.5   after:block after:absolute lg:after:top-5 after:top-3 after:-left-1 text-xs ${status !== "paid" ? "after:bg-secondary" : "after:bg-primary text-white font-semibold"}`}>
        <div className="block whitespace-nowrap z-10">
          <span
            className={`w-6 h-6  border  rounded-full flex justify-center items-center mx-auto mb-2.5 text-xs  lg:w-9 lg:h-9 ${status === "open" ? "text-primary border-primary bg-[#202025]" : "bg-primary text-black"}`}
          >
            <ClockCircleIcon size={21} />
          </span>{" "}
          در جریان
        </div>
      </li>

      <li className={`flex relative text-muted text-xs text-center ${status==="paid"?"text-white font-semibold":""}`}>
        <div className="block whitespace-nowrap z-10">
          <span
            className={`w-6 h-6  border  rounded-full flex justify-center items-center mx-auto mb-2.5 text-xs  lg:w-9 lg:h-9 ${status !== "paid" ? " bg-[#202025] border-secondary" : "bg-primary border-primary text-black"}`}
          >
            <CheckReadIcon size={21} />
          </span>{" "}
          تسویه
        </div>
      </li>
    </ol>
  );
};

export default Stepper;

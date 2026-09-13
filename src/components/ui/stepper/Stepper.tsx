import { AddCircleIcon, CheckReadIcon, ClockCircleIcon } from "@solar-icons/react/outline";

const Stepper = () => {
  return (
    <ol className="flex items-center justify-center w-full text-xs text-gray-900 font-medium sm:text-base ">
      <li className="flex w-full relative text-white text-center font-semibold text-xs    after:w-full after:h-0.5  after:bg-primary after:block after:absolute lg:after:top-5 after:-left-1">
        <div className="block whitespace-nowrap z-10">
          <span className="w-6 h-6 bg-primary border border-transparent rounded-full grid place-items-center mx-auto mb-2.5 text-xs text-black lg:w-9 lg:h-9">
            <AddCircleIcon size={21}/>
          </span>{" "}
          ثبت
        </div>
      </li>
      <li className="flex w-full relative text-muted text-center   after:w-full after:h-0.5  after:bg-secondary after:block after:absolute lg:after:top-5 after:top-3 after:-left-1 text-xs">
        <div className="block whitespace-nowrap z-10">
          <span className="w-6 h-6 bg-[#202025] border border-primary rounded-full flex justify-center items-center mx-auto mb-2.5 text-xs text-primary lg:w-9 lg:h-9">
            <ClockCircleIcon size={21}/>
          </span>{" "}
          در جریان
        </div>
      </li>

      <li className="flex relative text-muted text-xs text-center ">
        <div className="block whitespace-nowrap z-10">
          <span className="w-6 h-6 bg-[#202025] border border-secondary rounded-full flex justify-center items-center mx-auto mb-2.5 text-xs  lg:w-9 lg:h-9">
            <CheckReadIcon size={21}/>
          </span>{" "}
          تسویه
        </div>
      </li>
    </ol>
  );
};

export default Stepper;

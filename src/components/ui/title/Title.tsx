import { Button, IconChevronLeft } from "@heroui/react";

type TitleProps = {
  text: string;
  btnText: string;
  onOpen?: () => void;
};

const Title = ({ text, btnText, onOpen }:TitleProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <h3 className="text-[26px] font-semibold">{text}</h3>
      <div className="flex items-center gap-x-3.5">
        <Button className={"bg-primary text-black h-12 px-5"} onPress={onOpen}>
          {btnText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </Button>
        <Button isIconOnly className="w-12 h-12 rounded-full bg-secondary">
          <IconChevronLeft />
        </Button>
      </div>
    </div>
  );
};

export default Title;

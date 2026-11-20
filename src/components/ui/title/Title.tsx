import { Button, IconChevronLeft } from "@heroui/react";

type TitleProps = {
  text: string;
  btnText: string;
  onOpen?: () => void;
};

const Title = ({ text, btnText, onOpen }: TitleProps) => {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 lg:mt-4">
      <h3 className="truncate text-xl font-semibold sm:text-2xl lg:text-[26px]">
        {text}
      </h3>
      <div className="flex shrink-0 items-center gap-x-3.5">
        <Button
          className="h-11 bg-primary px-4 text-sm text-black lg:h-12 lg:px-5 lg:text-base"
          onPress={onOpen}
        >
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
        <Button
          isIconOnly
          className="hidden h-12 w-12 rounded-full bg-secondary lg:flex"
        >
          <IconChevronLeft />
        </Button>
      </div>
    </div>
  );
};

export default Title;
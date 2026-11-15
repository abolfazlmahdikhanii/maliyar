import { Button } from "@heroui/react";
import {
  AltArrowLeftIcon,
  AltArrowRightIcon,
} from "@solar-icons/react/outline";
import type { Dispatch, SetStateAction } from "react";

const optionClass = (selected: boolean) =>
  [
    "flex h-14 w-full items-center justify-center rounded-xl border",
    "px-2 text-sm transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    selected
      ? "border-primary bg-primary/15 font-semibold text-primary"
      : "border-secondary bg-secondary/30 text-white/65 hover:border-primary/30 hover:bg-secondary hover:text-white",
  ].join(" ");
type YearItemsProps = {
  setYearPage: Dispatch<SetStateAction<number>>;
  setDraftYear: Dispatch<SetStateAction<number>>;
  draftYear: number;
  yearPage: number;
};
const YearItems = ({
  setYearPage,
  draftYear,
  setDraftYear,
  yearPage,
}: YearItemsProps) => {
  const years = Array.from({ length: 12 }, (_, index) => yearPage + index);
  return (
    <>
      {" "}
      <div className="mb-4 flex items-center justify-between px-2">
        <Button
          isIconOnly
          variant="tertiary"
          aria-label="۱۲ سال قبل"
          onPress={() => setYearPage((page) => page - 12)}
          className="min-w-9 rounded-lg text-white/60 transition-colors hover:bg-secondary hover:text-primary"
        >
          <AltArrowRightIcon size={20} />
        </Button>

        <span className="text-base tabular-nums text-muted">
          {years[0]} تا {years[11]}
        </span>

        <Button
          isIconOnly
          variant="tertiary"
          aria-label="۱۲ سال بعد"
          onPress={() => setYearPage((page) => page + 12)}
          className="min-w-9 rounded-lg text-white/60 transition-colors hover:bg-secondary hover:text-primary"
        >
          <AltArrowLeftIcon size={20} />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((item) => (
          <Button
            key={item}
            type="button"
            aria-pressed={draftYear === item}
            onPress={() => setDraftYear(item)}
            className={optionClass(draftYear === item)}
          >
            {item}
          </Button>
        ))}
      </div>
    </>
  );
};

export default YearItems;

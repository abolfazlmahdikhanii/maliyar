import { Button } from "@heroui/react";
import { months } from "../../../../../../data/months";
const optionClass = (selected: boolean) =>
  [
    "flex h-14 w-full items-center justify-center rounded-xl border",
    "px-2 text-sm transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    selected
      ? "border-primary bg-primary/15 font-semibold text-primary"
      : "border-secondary bg-secondary/30 text-white/65 hover:border-primary/30 hover:bg-secondary hover:text-white",
  ].join(" ");

type MonthItemsProps = {
  draftMonth: number;
  setDraftMonth: (a: number) => void;
};
const MonthItems = ({ draftMonth, setDraftMonth }: MonthItemsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {months.map((name, index) => (
        <Button
          key={name}
          type="button"
          aria-pressed={draftMonth === index}
          onClick={() => setDraftMonth(index)}
          className={optionClass(draftMonth === index)}
        >
          {name}
        </Button>
      ))}
    </div>
  );
};

export default MonthItems;

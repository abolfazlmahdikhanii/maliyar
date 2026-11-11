import { Button } from "@heroui/react";
import {
  AltArrowLeftIcon,
  AltArrowRightIcon,
} from "@solar-icons/react/outline";
import { useState } from "react";
import { months } from "../../../../data/months";
import MonthItems from "./elements/month-items/MonthItems";
import PickerModal from "./elements/picker-modal/PickerModal";
import YearItems from "./elements/year-items/YearItems";

type MonthYearValue = {
  year: number;
  month: number;
  monthName: string;
};

type MonthYearPickerProps = {
  initialYear?: number;
  initialMonth?: number;
  onChange?: (value: MonthYearValue) => void;
};

export default function MonthYearPicker({
  initialYear = 1405,
  initialMonth = 7,
  onChange,
}: MonthYearPickerProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth - 1);

  const [modal, setModal] = useState<"month" | "year" | null>(null);

  const [draftYear, setDraftYear] = useState(initialYear);
  const [draftMonth, setDraftMonth] = useState(initialMonth - 1);

  const [yearPage, setYearPage] = useState(Math.floor(initialYear / 12) * 12);

  const emitChange = (nextYear: number, nextMonth: number) => {
    onChange?.({
      year: nextYear,
      month: nextMonth + 1,
      monthName: months[nextMonth],
    });
  };

  const changeMonth = (step: number) => {
    let nextMonth = month + step;
    let nextYear = year;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    setMonth(nextMonth);
    setYear(nextYear);
    emitChange(nextYear, nextMonth);
  };

  const openMonthModal = () => {
    setDraftMonth(month);
    setModal("month");
  };

  const openYearModal = () => {
    setDraftYear(year);
    setYearPage(Math.floor(year / 12) * 12);
    setModal("year");
  };

  const confirmMonth = () => {
    setMonth(draftMonth);
    setModal(null);
    emitChange(year, draftMonth);
  };

  const confirmYear = () => {
    setYear(draftYear);
    setModal(null);
    emitChange(draftYear, month);
  };

  return (
    <div dir="rtl" className="box-date__picker w-fit rounded-2xl">
      <div className="flex items-center justify-center gap-2">
        <Button
          isIconOnly
          variant="tertiary"
          aria-label="ماه قبل"
          onPress={() => changeMonth(-1)}
          className="flex items-center justify-center text-white/70 transition-colors hover:text-primary"
        >
          <AltArrowRightIcon size={20} />
        </Button>

        <div className="flex items-center gap-1">
          <Button
            onClick={openMonthModal}
            variant="ghost"
            className="w-18 rounded-lg px-2 py-2.5 text-center font-semibold text-white"
          >
            {months[month]}
          </Button>

          <Button
            variant="ghost"
            onClick={openYearModal}
            className="rounded-lg px-3 py-2.5 font-semibold tabular-nums text-primary "
          >
            {year}
          </Button>
        </div>

        <Button
          isIconOnly
          variant="tertiary"
          aria-label="ماه بعد"
          onPress={() => changeMonth(1)}
          className="flex items-center justify-center text-white/70 transition-colors hover:text-primary"
        >
          <AltArrowLeftIcon size={20} />
        </Button>
      </div>

      {modal === "month" && (
        <PickerModal
          title="انتخاب ماه"
          onClose={() => setModal(null)}
          onConfirm={confirmMonth}
        >
          <MonthItems draftMonth={draftMonth} setDraftMonth={setDraftMonth} />
        </PickerModal>
      )}

      {modal === "year" && (
        <PickerModal
          title="انتخاب سال"
          onClose={() => setModal(null)}
          onConfirm={confirmYear}
        >
          <YearItems
            draftYear={draftYear}
            setDraftYear={setDraftYear}
            yearPage={yearPage}
            setYearPage={setYearPage}
          />
        </PickerModal>
      )}
    </div>
  );
}

import { Calendar, DateField, DatePicker, Label } from "@heroui/react";
import type {
  CalendarDate,
  CalendarDateTime,
  DateValue,
  ZonedDateTime,
} from "@internationalized/date";

type DatePickerInputProps = {
  date: DateValue|null;
  onDate: (
    date: CalendarDate | CalendarDateTime | ZonedDateTime | null,
  ) => void;
};

const DatePickerInput = ({ date, onDate }: DatePickerInputProps) => {
  return (
    <DatePicker
      className={"flex flex-col gap-2 w-full"}
      name="date"
      value={date}
      onChange={onDate}
    >
      <Label className="text-muted text-sm">تاریخ</Label>
      <DateField.Group
        fullWidth
        className="box-date__input px-1 input  bg-transparent focus-within:ring-primary h-12.75"
      >
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator className="text-primary data-[hovered]:text-primary/80 data-[pressed]:text-primary/60" />
          </DatePicker.Trigger>
        </DateField.Suffix>
        <DateField.Input
          className={"input bg-transparent focus:border-primary"}
          dir="ltr"
        >
          {(segment) => (
            <DateField.Segment
              segment={segment}
              className="data-[focused]:bg-primary/20 data-[focused]:text-primary "
            />
          )}
        </DateField.Input>
      </DateField.Group>

      <DatePicker.Popover className={"box-date "}>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger className="data-[hovered]:text-primary/80 data-[pressed]:text-primary/60">
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator className="rotate-180 -mt-0.5 mr-0.5 text-primary" />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton
              slot="previous"
              className="rotate-180 data-[hovered]:bg-primary/10 data-[hovered]:text-primary data-[pressed]:bg-primary/20 text-primary"
            />
            <Calendar.NavButton
              slot="next"
              className="rotate-180 data-[hovered]:bg-primary/10 data-[hovered]:text-primary data-[pressed]:bg-primary/20 text-primary"
            />
          </Calendar.Header>

          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day[0]}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell
                  date={date}
                  className="
                data-[selected]:bg-primary data-[selected]:text-black data-[today]:border data-[today]:border-primary data-[today]:text-primary data-[today]:bg-primary/15 data-[hovered]:bg-primary/15 data-[focused]:ring-2 data-[focused]:ring-primary/50"
                />
              )}
            </Calendar.GridBody>
          </Calendar.Grid>

          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => (
                <Calendar.YearPickerCell
                  year={year}
                  className="
                data-[selected]:bg-[#9fe870]
                data-[selected]:text-black
                data-[hovered]:bg-[#9fe870]/15
              "
                />
              )}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
};

export default DatePickerInput;

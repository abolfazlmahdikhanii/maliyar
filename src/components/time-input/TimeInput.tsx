import { Label, TimeField, type TimeValue } from "@heroui/react";

type TimeInputProps = {
  time: TimeValue | null;
  onTime: (time: TimeValue | null) => void;
};

const TimeInput = ({ time, onTime }:TimeInputProps) => {
  return (
    <TimeField className={"flex flex-col gap-2"} value={time} onChange={onTime}>
      <Label className="text-muted text-sm">زمان</Label>
      <TimeField.Group
        className="box-date__input input  bg-transparent focus-within:ring-primary h-13"
        dir="ltr"
      >
        <TimeField.Input
          className={"input bg-transparent focus:border-primary"}
        >
          {(segment) => (
            <TimeField.Segment
              segment={segment}
              className="data-[focused]:bg-primary/20 data-[focused]:text-primary "
            />
          )}
        </TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
};

export default TimeInput;

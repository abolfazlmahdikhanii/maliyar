import { type Key, Label, ListBox, Select } from "@heroui/react";

export type SelectOption = { id: string; label: string };

type FormSelectProps = {
  label: string;
  value: Key | null;
  onChange: (value: Key | null) => void;
  options: SelectOption[];
};

const FormSelect = ({ label, value, onChange, options }: FormSelectProps) => (
  <Select
    className="flex w-full min-w-0 flex-col gap-2"
    placeholder="انتخاب کنید"
    value={value}
    onChange={onChange}
  >
    <Label className="text-muted text-xs sm:text-sm">{label}</Label>
    <Select.Trigger className="box input h-12 sm:h-13">
      <Select.Value className=" text-sm sm:text-base" />
      <Select.Indicator className="" />
    </Select.Trigger>
    <Select.Popover className="box-modal-2 ">
      <ListBox>
        {options.map((o) => (
          <ListBox.Item
            key={o.id}
            id={o.id}
            textValue={o.label}
            className="p-2.5 text-sm sm:text-base"
          >
            {o.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
);

export default FormSelect;
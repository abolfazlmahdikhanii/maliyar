import { Form, Input, Label, ListBox, Select } from "@heroui/react";
import { useState } from "react";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import type { TabForm } from "../dues-form/DuesForm";
import FormTab from "../ui/form-tab/FormTab";
import InputPrice from "../ui/input-price/InputPrice";

type checkTypeState = "incomeCheck" | "outcomeCheck";
const tabs: TabForm<checkTypeState>[] = [
  {
    id: 1,
    title: "چک دریافتی",
    value: "incomeCheck",
    selectedColor: "bg-primary/15 text-primary",
  },
  {
    id: 2,
    title: "چک پرداختی",
    value: "outcomeCheck",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
];
const CheckForm = () => {
  const [checkType, setCheckType] = useState<checkTypeState>("incomeCheck");

  const [checkPrice, setCheckPrice] = useState<string>("0");
  return (
    <Form className="px-2">
    <FormTab
        tabs={tabs}
        selectedTab={checkType}
        setSelectedTab={(val: string) => setCheckType(val as checkTypeState)}
      />
      <div className="mt-4">
        {/* price */}
        <InputPrice price={checkPrice} setPrice={setCheckPrice} />
      </div>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-8">
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
            شماره سریال
          </Label>
          <Input
            id="title"
            placeholder="284591"
            type="text"
            className={"box input h-13"}
          />
        </div>
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              بانک{" "}
            </Label>
            <Select.Trigger className={"box input h-13"}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className={"box-modal-2"}>
              <ListBox>
                <ListBox.Item
                  id="option1"
                  textValue="Option 1"
                  className="p-2.5"
                >
                  Option 1
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </section>
      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          {checkType === "incomeCheck" ? " در وجه (صادرکننده)" : "در وجهِ"}
        </Label>
        <Input
          id="title"
          placeholder="نام شخص / شرکت"
          type="text"
          className={"box input h-13"}
        />
      </div>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5 mb-3">
        <DatePickerInput />

        <DatePickerInput />
      </section>
    </Form>
  );
};

export default CheckForm;

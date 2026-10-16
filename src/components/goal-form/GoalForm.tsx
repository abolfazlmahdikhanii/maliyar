import { Form, Input, Label, ListBox, Select } from "@heroui/react";
import DatePickerInput from "../date-picker-input/DatePickerInput";

const GoalForm = () => {
  return (
    <Form className="px-2">
      <div className="flex flex-col gap-2 max-w-2xl ">
        <Label htmlFor="title" className="text-muted text-sm">
          نام هدف
        </Label>
        <Input
          id="title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className={"box input h-13"}
        />
      </div>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              دسته{" "}
            </Label>
            <Select.Trigger className={"box input h-13 "}>
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
        <div className="flex flex-col gap-2 max-w-2xl">
          <Label htmlFor="title" className="text-muted text-sm">
            مبلغ هدف (تومان) *
          </Label>
          <Input
            id="title"
            placeholder="0"
            type="text"
            className={"box input h-13"}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <div className="flex flex-col gap-2 max-w-2xl">
          <Label htmlFor="title" className="text-muted text-sm">
            پس انداز فعلی (تومان) *
          </Label>
          <Input
            id="title"
            placeholder="0"
            type="text"
            className={"box input h-13"}
          />
        </div>
        <DatePickerInput />
      </section>
      <section className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              حساب پس‌انداز <span className="text-[10px]">(اختیاری — هنگام پس‌انداز از این حساب کسر می‌شود)</span>
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
                  بدون حساب متصل
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </section>
    </Form>
  );
};

export default GoalForm;

import { Form, Input, Label, ListBox, Select } from "@heroui/react";
import { useState } from "react";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import type { TabForm } from "../dues-form/DuesForm";
import FormTab from "../ui/form-tab/FormTab";

type subscriptionTypeState = "active" | "inactive";
type subscriptionTimeCycleState =
  | "weekly"
  | "monthly"
  | "three-month"
  | "yearly";

  const tabs: TabForm<subscriptionTypeState>[] = [
  {
    id: 1,
    title: "فعال",
    value: "active",
    selectedColor: "bg-primary/15 text-primary",
  },
  {
    id: 2,
    title: "متوقف",
    value: "inactive",
    selectedColor: "bg-[#f060601a] text-[#f06060]",
  },
];



const SubscriptionForm = () => {
  const [subscriptionType, setSubscriptionType] = useState<subscriptionTypeState>(
    "active",
  );
  const [subscriptionTimeCycle, setSubscriptionTimeCycle] = useState<
    subscriptionTimeCycleState
  >("monthly");

  return (
    <Form className="px-2">
      <div className="flex flex-col gap-2 max-w-2xl ">
        <Label htmlFor="title" className="text-muted text-sm">
          نام اشتراک
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
            مبلغ (تومان) *
          </Label>
          <Input
            id="title"
            placeholder="0"
            type="text"
            className={"box input h-13"}
          />
        </div>
      </section>
      <section className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          دوره پرداخت
        </Label>

        <section className="grid grid-cols-4 w-full p-1.5 gap-x-1 bg-secondary rounded-xl max-w-2xl border border-secondary">
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "weekly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("weekly")}
          >
            هفتگی
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "monthly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("monthly")}
          >
            ماهانه
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "three-month"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("three-month")}
          >
            سه ماهه
          </div>
          <div
            className={`transaction-type ${
              subscriptionTimeCycle === "yearly"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-secondary/80"
            } `}
            onClick={() => setSubscriptionTimeCycle("yearly")}
          >
            سالانه
          </div>
        </section>
      </section>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <DatePickerInput />
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              کسر از حساب (اختیاری){" "}
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

      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          وضعیت
        </Label>
         <FormTab
        tabs={tabs}
        selectedTab={subscriptionType}
        setSelectedTab={(val: string) => setSubscriptionType(val as subscriptionTypeState)}
      />
      </div>
    </Form>
  );
};

export default SubscriptionForm;

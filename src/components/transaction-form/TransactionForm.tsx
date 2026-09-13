import { Form, Input, Label, ListBox, Select, TextArea } from "@heroui/react";
import { useState } from "react";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import TimeInput from "../time-input/TimeInput";
import InputPrice from "../ui/input-price/InputPrice";
import Categories from "../ui/categories/Categories";

type transactionTypeState = "income" | "outcome";
const TransactionForm = () => {
  const [transactionType, setTransactionType] = useState<transactionTypeState>(
    "outcome",
  );
  const [categoryTransactionId, setCategoryTransactionId] = useState<
    string | null
  >(null);
  const [transactionPrice, setTransactionPrice] = useState<string>("0");
  return (
    <Form className="px-2">
      <section className="grid grid-cols-2 w-full p-1.5 bg-secondary rounded-xl max-w-2xl">
        <div
          className={`transaction-type ${
            transactionType === "outcome"
              ? "bg-[#f060601a] text-[#f06060]"
              : "text-muted"
          }`}
          onClick={() => setTransactionType("outcome")}
        >
          هزینه
        </div>
        <div
          className={`transaction-type ${
            transactionType === "income"
              ? "bg-primary/15 text-primary"
              : "text-muted"
          } `}
          onClick={() => setTransactionType("income")}
        >
          درآمد
        </div>
      </section>
      {/* price */}
      <InputPrice price={transactionPrice} setPrice={setTransactionPrice} />
      <div className="flex flex-col gap-2 max-w-2xl mt-7">
        <Label htmlFor="title" className="text-muted text-sm">
          عنوان (اختیاری)
        </Label>
        <Input
          id="title"
          placeholder="اگر خالی بگذارید نام دسته بندی ثبت میشود"
          type="text"
          className={"box input h-13"}
        />
      </div>
      <Categories categoryId={categoryTransactionId} setCategoryId={setCategoryTransactionId}/>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              حساب{" "}
            </Label>
            <Select.Trigger className={"box input h-13 "}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className={"box-modal-2"}>
              <ListBox>
                <ListBox.Item id="option1" textValue="Option 1" className="p-2.5">
                  Option 1
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div>
          <Select
            className="w-full flex-col flex gap-2 "
            placeholder="انتخاب کنید"
          >
            <Label htmlFor="title" className="text-muted text-sm">
              حساب{" "}
            </Label>
            <Select.Trigger className={"box input h-13"}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className={"box-modal-2"}>
              <ListBox>
                <ListBox.Item id="option1" textValue="Option 1" className="p-2.5">
                  Option 1
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-5.5">
        <DatePickerInput />

        <TimeInput />
      </section>
      <section className="max-w-2xl mt-5.5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-muted text-sm">
            یادداشت{" "}
          </Label>
          <TextArea
            aria-label="note"
            className="box input h-24 w-full resize-none"
            placeholder="توضیحات اختیاری..."
          />
        </div>
      </section>
    </Form>
  );
};

export default TransactionForm;

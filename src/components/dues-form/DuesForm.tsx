import { Form, Input, Label, TextArea } from "@heroui/react";
import DatePickerInput from "../date-picker-input/DatePickerInput";
import InputPrice from "../ui/input-price/InputPrice";
import { useState } from "react";


type duesTypeState="debt"|"claim"
const DuesForm = () => {
    const [duesType,setDuesType]=useState<duesTypeState>("debt")
      const [duesPrice, setDuesPrice] = useState<string>("0");
  return (
    <Form className="px-2">
      <section className="grid grid-cols-2 w-full p-1.5 bg-secondary rounded-xl max-w-2xl">
        <div
          className={`transaction-type ${
            duesType === "debt"
              ? "bg-[#f060601a] text-[#f06060]"
              : "text-muted"
          }`}
          onClick={() => setDuesType("debt")}
        >
          بدهی من
        </div>
        <div
          className={`transaction-type ${
            duesType === "claim"
              ? "bg-primary/15 text-primary"
              : "text-muted"
          } `}
          onClick={() => setDuesType("claim")}
        >
          طلب من
        </div>
      </section>
      {/* price */}
      <InputPrice price={duesPrice} setPrice={setDuesPrice} />

      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-7.5">
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
           طرف حساب
          </Label>
          <Input
            id="title"
            placeholder="نام شخص یا شرکت"
            type="text"
            className={"box input h-13"}
          />
        </div>
        <DatePickerInput />
      </section>
      <section className="max-w-2xl mt-5.5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-muted text-sm">
            علت یا شرح{" "}
          </Label>
          <TextArea
            aria-label="note"
            className="box input h-24 w-full resize-none"
            placeholder="توضیحات ..."
          />
        </div>
      </section>
    </Form>
  );
};

export default DuesForm;

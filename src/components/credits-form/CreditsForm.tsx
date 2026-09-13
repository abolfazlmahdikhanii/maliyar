import { Form, Input, Label } from "@heroui/react";
import DatePickerInput from "../date-picker-input/DatePickerInput";

const CreditsForm = () => {
  return (
    <Form className="px-2">
      <section>
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
            عنوان وام
          </Label>
          <Input
            id="title"
            placeholder="نام شخص یا شرکت"
            type="text"
            className={"box input max-h-12.5"}
          />
        </div>
      </section>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-7.5">
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
            نرخ بهره
          </Label>
          <Input
            id="title"
            placeholder="نام شخص یا شرکت"
            type="text"
            className={"box input max-h-12.5"}
          />
        </div>
        <DatePickerInput />
      </section>
      <section className="grid grid-cols-2 gap-5 max-w-2xl mt-7.5 mb-2">
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
            قسط ماهانه (تومان){" "}
          </Label>
          <Input
            id="title"
            placeholder="نام شخص یا شرکت"
            type="text"
            className={"box input max-h-12.5"}
          />
        </div>
        <div className="flex flex-col gap-2 max-w-2xl ">
          <Label htmlFor="title" className="text-muted text-sm">
            مدت (ماه)
          </Label>
          <Input
            id="title"
            placeholder="نام شخص یا شرکت"
            type="text"
            className={"box input max-h-12.5"}
          />
        </div>
      </section>
    </Form>
  );
};

export default CreditsForm;

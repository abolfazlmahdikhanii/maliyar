import { Form, Input, InputGroup, Label } from "@heroui/react";
import { useState } from "react";
import CardHolder from "../ui/card-holder/CardHolder";

type accountTypeState = "card" | "cash";
const AccountsForm = () => {
  const [accountType, setAccountType] = useState<accountTypeState>("card");

  return (
    <Form className="px-2">
      <CardHolder cardNumber="61043374"/>
      <div className="flex flex-col gap-2 mt-6">
        <Label htmlFor="title" className="text-muted text-sm">
          نوع حساب
        </Label>
        <section className="grid grid-cols-2 w-full p-1.5 bg-secondary rounded-xl max-w-2xl">
          <div
            className={`transaction-type ${
              accountType === "card"
                ? "bg-primary/15 text-primary"
                : "text-muted"
            } `}
            onClick={() => setAccountType("card")}
          >
            کارت بانکی
          </div>
          <div
            className={`transaction-type ${
              accountType === "cash"
                ? "bg-primary/15 text-primary"
                : "text-muted"
            }`}
            onClick={() => setAccountType("cash")}
          >
            کیف پول نقدی
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          شماره کارت (اختیاری)
        </Label>
        <Input
          id="title"
          placeholder="6037664519206396"
          type="text"
          className={"box input h-13"}
        />
      </div>
      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          شماره شبا (اختیاری)
        </Label>
        <InputGroup fullWidth className={"box input h-13  data-[focus-within=true]:ring-1 data-[focus-within=true]:ring-primary"}>
          <InputGroup.Input
            id="title"
            placeholder="IR062960000000100324200001"
            type="text"
            className={"border-l border-l-secondary  focus:outline-none focus:shadow-none"}
          />
          <InputGroup.Prefix>
            <span className="pr-3">IR</span>
          </InputGroup.Prefix>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          موجودی اولیه (تومان)
        </Label>
        <Input
          id="title"
          placeholder="0"
          type="text"
          className={"box input h-13"}
        />
      </div>
    </Form>
  );
};

export default AccountsForm;

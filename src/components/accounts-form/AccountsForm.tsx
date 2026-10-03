import { Form, Input, InputGroup, Label } from "@heroui/react";
import { useState, type ChangeEvent } from "react";
import { cardFormatter } from "../../utils/cardFormatter";
import type { TabForm } from "../dues-form/DuesForm";
import CardHolder from "../ui/card-holder/CardHolder";
import FormTab from "../ui/form-tab/FormTab";

type accountTypeState = "card" | "wallet";
const tabs: TabForm<accountTypeState>[] = [
  {
    id: 1,
    title: " کارت بانکی",
    value: "card",
    selectedColor: "bg-primary/15 text-primary",
  },
  {
    id: 2,
    title: "کیف پول نقدی",
    value: "wallet",
    selectedColor: "bg-primary/15 text-primary",
  },
];

const AccountsForm = () => {
  const [accountType, setAccountType] = useState<accountTypeState>("card");
  const [cardNumber, setCardNumber] = useState<string[]>([]);
  const [iban, setIban] = useState<string>("");
  const [initialBalance, setInitialBalance] = useState<string>("");

  const formatCardNumber = (event: ChangeEvent<HTMLInputElement>) => {
    
    setCardNumber(cardFormatter(event.target.value));
  };
  return (
    <Form className="px-2">
      <CardHolder cardNumber={cardNumber} iban={iban} isForm={true} type={accountType} />
      <div className="flex flex-col gap-2 mt-6">
        <Label htmlFor="title" className="text-muted text-sm">
          نوع حساب
        </Label>
        <FormTab
        tabs={tabs}
        selectedTab={accountType}
        setSelectedTab={(val: string) => setAccountType(val as accountTypeState)}
      />
       
      </div>

      {
        accountType!=="wallet"&&<>
        <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          شماره کارت (اختیاری)
        </Label>
        <Input
          id="title"
          placeholder="6037664519206396"
          type="text"
          inputMode="numeric"
          dir="ltr"
          maxLength={19}
          value={cardNumber.join(" ")}
          onChange={(event) => {formatCardNumber(event)}}
          className={"box input h-13"}
        />
      </div>
      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          شماره شبا (اختیاری)
        </Label>
        <InputGroup
          fullWidth
          className={
            "box input h-13  data-[focus-within=true]:ring-1 data-[focus-within=true]:ring-primary"
          }
        >
          <InputGroup.Input
            id="title"
            placeholder="062960000000100324200001"
            type="text"
            className={
              "border-l border-l-secondary  focus:outline-none focus:shadow-none"
            }
            onChange={(event) => setIban(event.target.value)}
            value={iban}
          />
          <InputGroup.Prefix>
            <span className="pr-3">IR</span>
          </InputGroup.Prefix>
        </InputGroup>
      </div>
        </>
      }
      <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
        <Label htmlFor="title" className="text-muted text-sm">
          موجودی اولیه (تومان)
        </Label>
        <Input
          id="title"
          placeholder="0"
          type="text"
          className={"box input h-13"}
          onChange={(event) => setInitialBalance(event.target.value)}
          value={initialBalance}
        />
      </div>
    </Form>
  );
};

export default AccountsForm;

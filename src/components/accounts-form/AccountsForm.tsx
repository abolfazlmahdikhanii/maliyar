import { Form, Input, InputGroup, Label, toast } from "@heroui/react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type ChangeEvent } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { bankDetectorHandler } from "../../utils/bankDetector";
import { cardFormatter } from "../../utils/cardFormatter";
import { formatNumber } from "../../utils/formatNumber";
import { accountFormSchema } from "../../validators/accounts";
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
type Detail = {
  type: accountTypeState;
  cardNumber?: string;
  iban?: string;
  initialBalance: number;
  accountID: Id<"accounts">;
};

export type FormProps = {
  onSuccess?: () => void;
  formId: string;
  onLoadingChange: (a: boolean) => void;
  loading: boolean;
  
};

type AccountFormProps={
  detail?: Detail;
}&FormProps
const AccountsForm = ({
  onSuccess,
  formId,
  onLoadingChange,
  loading = false,
  detail,
}: AccountFormProps) => {
  const add = useMutation(api.accounts.add);
  const update = useMutation(api.accounts.update);

  const [accountType, setAccountType] = useState<accountTypeState>(
    detail?.type || "card",
  );
  const [cardNumber, setCardNumber] = useState<string[]>(
    detail?.cardNumber ? cardFormatter(detail?.cardNumber) : [],
  );
  const [iban, setIban] = useState<string>(detail?.iban || "");
  const [initialBalance, setInitialBalance] = useState<string>(
    String(detail?.initialBalance) || "",
  );

  const formatCardNumber = (event: ChangeEvent<HTMLInputElement>) => {
    setCardNumber(cardFormatter(event.target.value));
  };
  const reset = () => {
    setAccountType("card");
    setCardNumber([]);
    setIban("");
    setInitialBalance("");
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    const accountData = accountFormSchema.safeParse({
      type: accountType,
      cardNumber: cardNumber.join(""),
      iban: iban,
      initialBalance: initialBalance,
      bank:
        accountType === "card"
          ? (bankDetectorHandler(cardNumber.join(""))?.code ?? "unknown")
          : "cash",
    });
    if (!accountData.success)
      return toast.danger(accountData.error.issues[0].message);

    onLoadingChange(true);

    try {
      if (!detail) {
        await add(accountData.data);
        toast.success("حساب با موفقیت ثبت شد.");
        reset();
      } else {
        await update({ ...accountData.data, id: detail.accountID });
        toast.success("حساب با موفقیت ویرایش شد.");
      }

      onSuccess?.();
    } catch (error) {
      console.log(error);
      toast.danger(
        error instanceof ConvexError
          ? String(error.data)
          : "خطا در ثبت حساب. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      onLoadingChange(false);
    }
  };
  return (
    <Form id={formId} className="px-2" onSubmit={handleSubmit}>
      <CardHolder
        cardNumber={cardNumber}
        iban={iban}
        isForm={true}
        type={accountType}
      />
      <div className="flex flex-col gap-2 mt-6">
        <Label htmlFor="title" className="text-muted text-sm">
          نوع حساب
        </Label>
        <FormTab
          tabs={tabs}
          selectedTab={accountType}
          setSelectedTab={(val: string) =>
            setAccountType(val as accountTypeState)
          }
        />
      </div>

      {accountType !== "wallet" && (
        <>
          <div className="flex flex-col gap-2 max-w-2xl mt-5.5">
            <Label htmlFor="title" className="text-muted text-sm">
              شماره کارت (اختیاری)
            </Label>
            <Input
              id="title"
              placeholder="6037 6645 1920 6396"
              type="text"
              inputMode="numeric"
              dir="ltr"
              maxLength={19}
              value={cardNumber.join(" ")}
              onChange={(event) => {
                formatCardNumber(event);
              }}
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
      )}
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
          value={formatNumber(initialBalance)}
        />
      </div>
    </Form>
  );
};

export default AccountsForm;

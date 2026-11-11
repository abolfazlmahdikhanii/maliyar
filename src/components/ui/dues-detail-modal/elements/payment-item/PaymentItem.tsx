import { Description, Radio } from "@heroui/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { getBankName } from "../../../../../utils/bankDetector";

type PaymentItemProps = {
  accountId: Id<"accounts">;
  bank: string;
  cardNumber?: string;
  balance: number;
  isDisabled?: boolean;
};

const PaymentItem = ({
  accountId,
  bank,
  cardNumber,
  balance,
  isDisabled,
}: PaymentItemProps) => {
  const subtitle = cardNumber
    ? `کارت ${cardNumber.slice(-4)}`
    : bank === "cash"
      ? "کیف پول نقدی"
      : "حساب بانکی";

  return (
    <Radio value={accountId} isDisabled={isDisabled}>
      <Radio.Content className="group relative flex w-full flex-row items-start justify-start gap-4 rounded-xl border border-transparent bg-surface px-5 py-4 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10 data-[disabled=true]:opacity-50">
        <Radio.Control className="absolute inset-e-4 top-3 size-5">
          <Radio.Indicator />
        </Radio.Control>
        <div className="flex flex-col gap-1.25">
          <span>{getBankName(bank)}</span>
          <Description>
            {subtitle} ·{" "}
            {isDisabled
              ? "موجودی کافی نیست"
              : `${balance.toLocaleString()} تومان`}
          </Description>
        </div>
      </Radio.Content>
    </Radio>
  );
};

export default PaymentItem;

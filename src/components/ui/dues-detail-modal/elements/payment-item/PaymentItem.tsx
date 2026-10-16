import { Description, Radio } from "@heroui/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useMemo } from "react";
import { getBankName } from "../../../../../utils/bankDetector";

type PaymentItemProps = {
  accountId: Id<"accounts">;
  bank: string;
  cardNumber: string;
};

const PaymentItem = ({ accountId, bank, cardNumber }) => {
    const bankInfo=useMemo(()=>getBankName(bank),[bank])
  return (
    <Radio value={accountId}>
      <Radio.Content
        className={
          "group relative flex w-full flex-row items-start justify-start gap-4 rounded-xl border border-transparent bg-surface px-5 py-4 transition-all data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
        }
      >
        <Radio.Control className="absolute inset-e-4 top-3 size-5">
          <Radio.Indicator />
        </Radio.Control>
        {/* <Icon className="size-6" icon={option.icon} /> */}
        <div className="flex flex-col gap-1.25">
          <span>{bankInfo}</span>
          <Description>
            پرداخت با {bankInfo}
          </Description>
        </div>
      </Radio.Content>
    </Radio>
  );
};

export default PaymentItem;

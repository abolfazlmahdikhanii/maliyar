import { Form, Label, RadioGroup, toast, type Key } from "@heroui/react";
import { InfoCircleIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState, type SyntheticEvent } from "react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import PaymentItem from "../dues-detail-modal/elements/payment-item/PaymentItem";
import FormModal from "../form-modal/FormModal";

type PayConfirmProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (accountId: Key | Id<"accounts">) => void;
  loading: boolean;
};

const PayConfirm = ({
  onSubmit,
  loading,
  isOpen,
  onOpenChange,
}: PayConfirmProps) => {
  const accounts = useQuery(api.accounts.list);
  const [accountID, setAccountID] = useState<Key | null>(
    accounts ? accounts[0]._id : null,
  );

  const payHandler = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!accounts?.length) {
      return toast.danger("حساب را ایجاد کنید");
    }

    const selectedAccountId = accountID ?? accounts[0]._id;
    onSubmit(selectedAccountId);
  };

  return (
    <>
      <FormModal
        title="ثبت پرداخت"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        btnText="ثبت پرداخت"
        formId={"payment-modal"}
        loading={loading}
      >
        <Form id={"payment-modal"} className="px-2 " onSubmit={payHandler}>
          {accounts?.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              هنوز حسابی ندارید. اول یک حساب بسازید.
            </p>
          ) : (
            <>
              <RadioGroup
                defaultValue={accounts ? accounts[0]?._id : ""}
                name="payment"
                variant="secondary"
                onChange={(value) => setAccountID(value)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Label>انتخاب حساب</Label>
                </div>
                <div className="grid gap-x-4 md:grid-cols-1">
                  {accounts?.map((info) => (
                    <PaymentItem
                      key={info._id}
                      accountId={info._id}
                      bank={info.bank}
                      cardNumber={info.cardNumber}
                    />
                  ))}
                </div>
              </RadioGroup>

              <div className="flex  gap-x-1.25 text-neutral-500 pt-8 pb-2">
                <InfoCircleIcon size={15} />
                <p className="text-xs leading-[1.7]">
                  تراکنش معادل در همین حساب ثبت و موجودی آن به‌روز می‌شود.
                </p>
              </div>
            </>
          )}
        </Form>
      </FormModal>
    </>
  );
};

export default PayConfirm;

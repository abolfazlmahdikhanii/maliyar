import { Form, Label, RadioGroup, toast, type Key } from "@heroui/react";
import { InfoCircleIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useId, useState, type SyntheticEvent } from "react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import PaymentItem from "../dues-detail-modal/elements/payment-item/PaymentItem";
import FormModal from "../form-modal/FormModal";

type Account = FunctionReturnType<typeof api.accounts.list>[number];

type PayConfirmProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (accountId: Key | Id<"accounts">) => void;
  loading: boolean;
  accountFilter?: (account: Account) => boolean;
  emptyMessage?: string;
  minBalance?: number;
  defaultAccountId?: Id<"accounts"> | null;
};

const PayConfirm = ({
  onSubmit,
  loading,
  isOpen,
  onOpenChange,
  accountFilter,
  emptyMessage = "هنوز حسابی ندارید. اول یک حساب بسازید.",
  minBalance,
  defaultAccountId,
}: PayConfirmProps) => {
  const formId = useId();
  const accounts = useQuery(api.accounts.list);
  const settings = useQuery(api.settings.get);
  const [selectedId, setSelectedId] = useState<Key | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setSelectedId(null);
  }

  const options = (accounts ?? []).filter(accountFilter ?? (() => true));
  const isEnabled = (a: Account) => a.balance >= (minBalance ?? 0);

  const preferredId = defaultAccountId ?? settings?.defaultAccountId ?? null;

  const accountId =
    options.find((a) => a._id === selectedId && isEnabled(a))?._id ??
    options.find((a) => a._id === preferredId && isEnabled(a))?._id ??
    options.find(isEnabled)?._id ??
    null;

  const payHandler = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!accountId) return toast.danger("موجودی هیچ حسابی کافی نیست");
    onSubmit(accountId);
  };

  return (
    <FormModal
      title="ثبت پرداخت"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      btnText="ثبت پرداخت"
      formId={formId}
      loading={loading}
    >
      <Form id={formId} className="px-2" onSubmit={payHandler}>
        {accounts === undefined ? (
          <p className="py-6 text-center text-sm text-muted">
            در حال بارگذاری...
          </p>
        ) : options.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{emptyMessage}</p>
        ) : (
          <>
            <RadioGroup
              value={accountId ?? ""}
              name="payment"
              variant="secondary"
              onChange={setSelectedId}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Label>انتخاب حساب</Label>
              </div>
              <div className="grid gap-x-4 md:grid-cols-1">
                {options.map((info) => (
                  <PaymentItem
                    key={info._id}
                    accountId={info._id}
                    bank={info.bank}
                    cardNumber={info.cardNumber}
                    balance={info.balance}
                    isDisabled={!isEnabled(info)}
                    defaultAccount={preferredId===info._id}
                  />
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-x-1.25 text-neutral-500 pt-8 pb-2">
              <InfoCircleIcon size={15} />
              <p className="text-xs leading-[1.7]">
                تراکنش معادل در همین حساب ثبت و موجودی آن به‌روز می‌شود.
              </p>
            </div>
          </>
        )}
      </Form>
    </FormModal>
  );
};

export default PayConfirm;

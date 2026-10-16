import {
  Button,
  Form,
  Label,
  RadioGroup,
  toast,
  type Key,
} from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type SyntheticEvent } from "react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import FormModal from "../../../form-modal/FormModal";
import PaymentItem from "../payment-item/PaymentItem";
import { InfoCircleIcon } from "@solar-icons/react/outline";

type PayDueProps = {
  style?: string;
  dueId: Id<"dues">;
};

const PayDue = ({ style, dueId }: PayDueProps) => {
  const accounts = useQuery(api.accounts.list);
  const pay = useMutation(api.dues.markPaid);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [accountID, setAccountID] = useState<Key | null>(accounts?accounts[0]._id:null);
  const payDueHandler = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!accountID) return toast.danger("حساب را انتخاب کنید");
    setLoading(true);
    try {
      await pay({
        id: dueId,
        accountId: accountID as Id<"accounts">,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success("پرداخت با موفقیت انجام شد");
      setIsOpen(false)
    } catch (error) {
      toast.danger(
        error instanceof ConvexError ? String(error.data) : "خطا در ثبت پرداخت",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button className={style} onClick={() => setIsOpen(true)} slot="close">
        ثبت پرداخت
      </Button>
      <FormModal
        title="ثبت پرداخت"
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        btnText="ثبت پرداخت"
        formId={"payment-modal"}
        loading={loading}
      >
        <Form
          id={"payment-modal"}
          className="px-2 "
          onSubmit={payDueHandler}
        >
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

export default PayDue;

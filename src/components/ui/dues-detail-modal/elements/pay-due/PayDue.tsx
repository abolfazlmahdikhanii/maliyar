import { Button, toast, type Key } from "@heroui/react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import PayConfirm from "../../../pay-confirm/PayConfirm";

type PayDueProps = {
  style?: string;
  dueId: Id<"dues">;
  minBalance?: number; 
};

const PayDue = ({ style, dueId, minBalance = 0 }: PayDueProps) => {
  const pay = useMutation(api.dues.markPaid);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const payDueHandler = async (accountId: Key | Id<"accounts">) => {
    if (loading) return;
    setLoading(true);
    try {
      await pay({
        id: dueId,
        accountId: accountId as Id<"accounts">,
        date: new Date().toLocaleDateString("sv-SE"),
      });
      toast.success("پرداخت با موفقیت انجام شد");
      setIsOpen(false);
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
      <Button className={style} onPress={() => setIsOpen(true)}>
        ثبت پرداخت
      </Button>
      <PayConfirm
        isOpen={isOpen}
        loading={loading}
        onSubmit={payDueHandler}
        onOpenChange={() => setIsOpen(false)}
        minBalance={minBalance}
      />
    </>
  );
};

export default PayDue;
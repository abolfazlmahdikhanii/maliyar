import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";


export async function applyToBalance(
  ctx: MutationCtx,
  accountId: Id<"accounts">,
  type: "income" | "outcome",
  amount: number,
  reverse = false,
) {
  const account = await ctx.db.get(accountId);
  if (!account) return;
  const sign = (type === "income" ? 1 : -1) * (reverse ? -1 : 1);
  await ctx.db.patch(accountId, { balance: account.balance + sign * amount });
}


export async function reverseTransaction(
  ctx: MutationCtx,
  transactionId: Id<"transactions">,
) {
  const transaction = await ctx.db.get(transactionId);
  
  if (!transaction) return;

  await applyToBalance(
    ctx,
    transaction.accountId,
    transaction.type,
    transaction.amount,
    true,
  );
  await ctx.db.delete(transaction._id);
}
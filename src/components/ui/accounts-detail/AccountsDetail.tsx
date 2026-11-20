import { Button, Modal, Tabs } from "@heroui/react";
import { Card2Icon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getBankName } from "../../../utils/bankDetector";
import { cardFormatter } from "../../../utils/cardFormatter";
import { Loader } from "../loading-box/LoadingBox";
import TomanIcon from "../toman-icon/TomanIcon";
import AccountDetailItem from "./elements/AccountDetailItem";
import AccountTransaction from "./elements/AccountTransaction";

type Filter = "all" | "income" | "outcome";

type AccountsDetailProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  accountId: Id<"accounts"> | null;
  bank?: string;
};

const AccountsDetail = ({
  isOpen = false,
  onOpenChange,
  accountId,
}: AccountsDetailProps) => {
  const accountDetail = useQuery(
    api.accounts.get,
    isOpen && accountId ? { id: accountId } : "skip",
  );
  const [filter, setFilter] = useState<Filter>("all");

  const transactions = accountDetail?.transactions ?? [];
  const visibleTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((item) => item.type === filter);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-135 box-modal">
              <Modal.Header className="flex flex-row items-center justify-between border-b border-b-secondary px-1 pb-4 pt-2">
                <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <div className="flex min-w-0 flex-col gap-y-1.5">
                    <p className="truncate text-lg font-semibold text-white">
                      {accountDetail ? getBankName(accountDetail.bank) : "..."}
                    </p>
                    <p className="text-sm text-muted">
                      {accountDetail?.transactionCount ?? "0"} تراکنش
                    </p>
                  </div>
                  <p className="flex items-center gap-x-1 text-xl font-semibold tracking-wide text-primary sm:text-2xl">
                    {accountDetail?.balance?.toLocaleString() ?? "0"}
                    <span className="text-neutral-400">
                      <TomanIcon width="15" height="15" />
                    </span>
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="min-h-80 px-0.5 sm:px-1.5">
                {accountDetail === undefined ? (
                  <Loader small />
                ) : accountDetail === null ? (
                  <p className="py-10 text-center text-sm text-muted">
                    حساب پیدا نشد.
                  </p>
                ) : (
                  <>
                    <div>
                      <AccountDetailItem
                        icon={Card2Icon}
                        title="شماره کارت"
                        value={
                          accountDetail?.cardNumber
                            ? cardFormatter(accountDetail.cardNumber).join(" ")
                            : "..."
                        }
                        dir="ltr"
                      />
                      <AccountDetailItem
                        icon={Card2Icon}
                        title="شماره شبا"
                        value={accountDetail?.iban ?? "..."}
                      />
                      <AccountDetailItem
                        icon={Card2Icon}
                        title="موجودی اولیه"
                        value={
                          accountDetail?.initialBalance.toLocaleString() ??
                          "..."
                        }
                      />
                      <AccountDetailItem
                        icon={Card2Icon}
                        title="درآمد ۳۰ روز اخیر"
                        value={
                          accountDetail?.totalIncome.toLocaleString() ?? "..."
                        }
                        style="text-primary font-semibold text-base flex items-center gap-x-1 tracking-wide"
                      />
                      <AccountDetailItem
                        icon={Card2Icon}
                        title="هزینه ۳۰ روز اخیر"
                        value={
                          accountDetail?.totalOutcome.toLocaleString() ?? "..."
                        }
                        style="text-danger font-semibold text-base flex items-center gap-x-1 tracking-wide"
                        noBorder
                      />
                    </div>

                    <div className="mx-0.5 mt-5 sm:mt-6">
                      <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-3">
                        <p className="text-[14px] font-semibold text-white">
                          تراکنش های حساب{" "}
                          <span className="text-xs text-muted">
                            ({accountDetail?.transactionCount})
                          </span>
                        </p>
                        <Tabs
                          selectedKey={filter}
                          onSelectionChange={(key) => setFilter(key as Filter)}
                        >
                          <Tabs.ListContainer className="w-max rounded-2xl border border-secondary bg-secondary px-0.5 py-0.5">
                            <Tabs.List aria-label="Options">
                              <Tabs.Tab
                                id="all"
                                className="h-8.5 whitespace-nowrap text-xs data-[selected=true]:text-black"
                              >
                                همه
                                <Tabs.Indicator className="bg-primary" />
                              </Tabs.Tab>
                              <Tabs.Tab
                                id="income"
                                className="h-8.5 whitespace-nowrap text-xs data-[selected=true]:text-black"
                              >
                                درآمد
                                <Tabs.Indicator className="bg-primary" />
                              </Tabs.Tab>
                              <Tabs.Tab
                                id="outcome"
                                className="h-8.5 whitespace-nowrap text-xs data-[selected=true]:text-black"
                              >
                                هزینه
                                <Tabs.Indicator className="bg-primary" />
                              </Tabs.Tab>
                            </Tabs.List>
                          </Tabs.ListContainer>
                        </Tabs>
                      </div>

                      <div className="mt-5 max-h-70 space-y-5 overflow-y-auto sm:mt-6.5 sm:space-y-6.5 sm:ml-5 sm:mr-2">
                        {visibleTransactions ? (
                          visibleTransactions.map((tr) => (
                            <AccountTransaction key={tr._id} {...tr} />
                          ))
                        ) : (
                          <p>تراکنشی وجود ندارد</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Modal.Body>

              <Modal.Footer className="pb-1">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl text-base sm:h-13 sm:w-1/2"
                  slot="close"
                >
                  بستن
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default AccountsDetail;
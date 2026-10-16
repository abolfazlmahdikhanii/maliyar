import { Button, Modal, Tabs } from "@heroui/react";
import { Card2Icon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getBankName } from "../../../utils/bankDetector";
import { cardFormatter } from "../../../utils/cardFormatter";
import { Loader } from "../loading-box/LoadingBox";
import AccountDetailItem from "./elements/AccountDetailItem";
import AccountTransaction from "./elements/AccountTransaction";
import TomanIcon from "../toman-icon/TomanIcon";

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
    isOpen&&accountId ? { id: accountId } : "skip",
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
              <Modal.Header className="flex items-center justify-between  flex-row pt-2 pb-4 px-1 border-b border-b-secondary">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-y-1.5">
                    <p className="text-lg text-white font-semibold">
                      {accountDetail ? getBankName(accountDetail.bank) : "..."}
                    </p>
                    <p className="text-sm text-muted">
                      {accountDetail?.transactionCount ?? "0"} تراکنش
                    </p>
                  </div>
                  <p className="text-primary font-semibold text-2xl flex items-center gap-x-1 tracking-wide">
                    {accountDetail?.balance?.toLocaleString() ?? "0"}{" "}
                    <span className="text-neutral-400">
                     <TomanIcon width="15" height="15"/>
                    </span>
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="px-1.5 min-h-80">
                {accountDetail === undefined ? (
                  <Loader small />
                ) : accountDetail === null ? (
                  <p className="py-10 text-center text-sm text-muted">
                    حساب پیدا نشد.
                  </p>
                ) : (
                  <>
                    <div className=" ">
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
                    <div className="mt-6 mx-0.5 ">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-[14px] font-semibold text-white">
                          تراکنش های حساب{" "}
                          <span className="text-xs text-muted">
                            ({accountDetail?.transactionCount})
                          </span>
                        </p>
                        <Tabs
                          className=" "
                          selectedKey={filter}
                          onSelectionChange={(key) => setFilter(key as Filter)}
                        >
                          <Tabs.ListContainer className="py-0.5 px-0.5 bg-secondary border border-secondary w-max rounded-2xl">
                            <Tabs.List aria-label="Options">
                              <Tabs.Tab
                                id="all"
                                className="h-8.5 data-[selected=true]:text-black text-xs whitespace-nowrap"
                              >
                                همه
                                <Tabs.Indicator className="bg-primary " />
                              </Tabs.Tab>
                              <Tabs.Tab
                                id="income"
                                className="h-8.5 data-[selected=true]:text-black text-xs whitespace-nowrap"
                              >
                                درآمد
                                <Tabs.Indicator className="bg-primary " />
                              </Tabs.Tab>
                              <Tabs.Tab
                                id="outcome"
                                className="h-8.5 data-[selected=true]:text-black text-xs whitespace-nowrap"
                              >
                                هزینه
                                <Tabs.Indicator className="bg-primary " />
                              </Tabs.Tab>
                            </Tabs.List>
                          </Tabs.ListContainer>
                        </Tabs>
                      </div>
                      <div className="mt-6.5 mr-2 ml-5 space-y-6.5 max-h-70">
                        {/* item */}
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
              <Modal.Footer className="pb-1 space-x-2">
                <Button
                  variant="outline"
                  className="h-13 rounded-xl w-1/2 text-base"
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

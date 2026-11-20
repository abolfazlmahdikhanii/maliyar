import { Button, Modal, Table } from "@heroui/react";
import { CloseCircleIcon } from "@solar-icons/react/outline";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import SimpleTable from "../simple-table/SimpleTable";

type DuesDetailModalProps = {
  title: string;
  isOpen: boolean;
  onOpenChange: () => void;
  id: Id<"loans">;
};

const FactorModal = ({
  title,
  isOpen = false,
  onOpenChange,
  id,
}: DuesDetailModalProps) => {
  const factors = useQuery(api.loans.get, { id });

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-135 box-modal">
              <Modal.Header className="flex flex-row items-center justify-between">
                <Modal.Heading className="font-semibold">{title}</Modal.Heading>
                <Button isIconOnly variant="ghost" slot="close">
                  <CloseCircleIcon size="25px" />
                </Button>
              </Modal.Header>

              <Modal.Body>
                <p className="mb-4 mt-1.25 text-xs leading-6 text-muted sm:mb-6">
                  {factors?.title} · قسط{" "}
                  {factors?.remainingDebt
                    ? factors.remainingDebt?.toLocaleString()
                    : 0}{" "}
                  تومان
                </p>

                <div className="max-h-[52dvh] overflow-auto sm:max-h-[46vh]">
                  <SimpleTable
                    headers={{
                      number: "شماره",
                      price: "مبلغ (تومان)",
                      status: "وضعیت پرداخت",
                    }}
                  >
                    {factors?.installments ? (
                      factors?.installments.map((item) => (
                        <Table.Row key={item.number}>
                          <Table.Cell className="text-xs sm:text-sm">
                            {item.number}
                          </Table.Cell>
                          <Table.Cell className="text-xs sm:text-sm">
                            {item.amount ? item.amount.toLocaleString() : 0}
                          </Table.Cell>
                          <Table.Cell
                            className={`whitespace-nowrap text-xs sm:text-sm ${
                              item.status === "unpaid"
                                ? "text-red-500"
                                : "text-primary"
                            }`}
                          >
                            {item.status === "unpaid"
                              ? "پرداخت نشده"
                              : "پرداخت شده"}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <p>هیچ اقساطی وجود ندارد</p>
                    )}
                  </SimpleTable>
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default FactorModal;
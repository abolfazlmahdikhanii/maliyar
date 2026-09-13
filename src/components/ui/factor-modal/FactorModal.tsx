import { Button, Modal } from "@heroui/react";
import SimpleTable from "../simple-table/SimpleTable";

type DuesDetailModalProps = {
  title: string;
  isOpen: boolean;
  onOpenChange: () => void;
};

const FactorModal = ({
  title,
  isOpen = false,
  onOpenChange,
}: DuesDetailModalProps) => {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-135 box-modal">
              <Modal.Header className="flex items-center justify-between  flex-row ">
                <Modal.Heading className="font-semibold"> {title}</Modal.Heading>
                <Button isIconOnly variant="outline" size="sm" slot={"close"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </Modal.Header>

              <Modal.Body>
                <p className="text-xs text-muted mb-6 mt-1.25">
                  وام خودرو — بانک سامان · قسط ۵٬۲۰۰٬۰۰۰ تومان
                </p>

               <div className="max-h-[46vh]">
                   <SimpleTable
                  headers={{ number: "شماره", price: "مبلغ (تومان)" }}
                >
                  x
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

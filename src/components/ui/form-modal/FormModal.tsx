import { Button, Modal, Spinner } from "@heroui/react";
import type { ReactNode } from "react";

type FormModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  children: ReactNode;
  btnText: string;
  formId: string;
  loading?: boolean;
};

const FormModal = ({
  isOpen,
  onOpenChange,
  title,
  btnText,
  children,
  formId,
  loading = false,
}: FormModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-xl box-modal">
            <Modal.Header className="flex items-center justify-between  flex-row">
              <Modal.Heading>{title}</Modal.Heading>
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
              <div className="mt-3">{children}</div>
            </Modal.Body>
            <Modal.Footer className="pb-1 space-x-2">
              <Button
                className="h-13 rounded-xl w-1/2 text-base bg-primary text-black"
                type="submit"
                form={formId}
                isDisabled={loading}
              >
                {btnText} {loading && <Spinner color="current" size="sm" />}
              </Button>
              <Button
                variant="outline"
                className="h-13 rounded-xl w-1/2 text-base"
                slot="close"
              >
                انصراف
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default FormModal;

import { Button, Modal } from "@heroui/react";
import { CloseCircleIcon } from "@solar-icons/react/outline";
import type { ReactNode } from "react";




type PickerModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
};
const PickerModal = ({
  title,
  children,
  onClose,
  onConfirm,
}: PickerModalProps) => {
  return (
    <Modal>
      <Modal.Backdrop
        isOpen
        isDismissable
        variant="blur"
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog
            aria-label={title}
            className="box-modal w-full max-w-md rounded-2xl p-5 text-white"
          >
            <Modal.Header className="flex items-center justify-between  flex-row mb-3">
              <Modal.Heading>{title}</Modal.Heading>
              <Button isIconOnly variant="ghost" slot={"close"}>
                <CloseCircleIcon size={"20px"} />
              </Button>
            </Modal.Header>

            <Modal.Body className="p-0">{children}</Modal.Body>

            <Modal.Footer className="mt-7 flex gap-3.5 p-0">
              <Button
                variant="tertiary"
                onPress={onClose}
                className="flex-1 rounded-xl border border-secondary text-white/70 h-13"
              >
                انصراف
              </Button>

              <Button
                onPress={onConfirm}
                className="flex-1 rounded-xl bg-primary font-semibold text-[#222226] h-13"
              >
                تأیید
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default PickerModal;

import { Button, Drawer, Modal, Spinner } from "@heroui/react";
import { CloseCircleIcon } from "@solar-icons/react/outline";
import { useEffect, useState, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 640px)";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isDesktop;
};

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
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-xl box-modal">
              <Modal.Header className="flex items-center justify-between flex-row">
                <Modal.Heading>{title}</Modal.Heading>
                <Button isIconOnly variant="ghost" slot="close">
                  <CloseCircleIcon size="25px" />
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
  }

  return (
    <Drawer>
      <Drawer.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) onOpenChange();
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog className="box-modal rounded-t-3xl">
            <Drawer.Handle />
            <Drawer.Header>
              <Drawer.Heading>{title}</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body>
              <div className="mt-1">{children}</div>
            </Drawer.Body>

            <Drawer.Footer>
              <div className="flex w-full gap-2 pb-[env(safe-area-inset-bottom)]">
                <Button
                  className="h-12 flex-1 rounded-xl bg-primary text-base text-black"
                  type="submit"
                  form={formId}
                  isDisabled={loading}
                >
                  {btnText} {loading && <Spinner color="current" size="sm" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-xl text-base"
                  onPress={onOpenChange}
                >
                  انصراف
                </Button>
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default FormModal;
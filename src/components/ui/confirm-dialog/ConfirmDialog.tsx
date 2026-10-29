import { AlertDialog, Button, Spinner } from "@heroui/react";

type ConfirmDialogProps = {
  isShowConfirm: boolean;
  onChangeShowConfirm: () => void;
  title: string;
  description: string;
  onSubmit?: () => void;
  loading:boolean
};

const ConfirmDialog = ({
  isShowConfirm,
  onChangeShowConfirm,
  title,
  description,
  onSubmit,
  loading
}: ConfirmDialogProps) => {
  return (
    <AlertDialog isOpen={isShowConfirm} onOpenChange={onChangeShowConfirm}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 box-modal">
            
            <AlertDialog.Header>
              <AlertDialog.Icon status="default" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>{description}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                انصراف
              </Button>
              <Button variant="danger"onClick={onSubmit} isDisabled={loading} >
                تایید {loading && <Spinner color="current" size="sm" />}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};

export default ConfirmDialog;

import { AlertDialog, Button, Spinner } from "@heroui/react";

export type ConfirmDialogProps = {
  isShowConfirm: boolean;
  onChangeShowConfirm: () => void;
  title: string;
  description: string;
  onSubmit?: () => void;
  loading:boolean;
  isSignout?:boolean;
};

const ConfirmDialog = ({
  isShowConfirm,
  onChangeShowConfirm,
  title,
  description,
  onSubmit,
  loading,
  isSignout
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
             
              <Button variant={isSignout?"danger-soft":"primary"} onClick={onSubmit} isDisabled={loading} >
                {isSignout?"خارج شوید":"تایید"} {loading && <Spinner color="current" size="sm" />}
              </Button>
               <Button slot="close" variant="tertiary">
                انصراف
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};

export default ConfirmDialog;

import { AlertDialog, Button, Spinner } from "@heroui/react";

type DeleteDialogProps = {
  isShowDelete: boolean;
  onChangeShowDelete: () => void;
  title: string;
  description: string;
  onRemove?: () => void;
  loading:boolean
};

const DeleteDialog = ({
  isShowDelete,
  onChangeShowDelete,
  title,
  description,
  onRemove,
  loading
}: DeleteDialogProps) => {
  return (
    <AlertDialog isOpen={isShowDelete} onOpenChange={onChangeShowDelete}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100 box-modal">
            
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>{description}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                انصراف
              </Button>
              <Button variant="danger"onClick={onRemove} isDisabled={loading} >
                حذف {loading && <Spinner color="current" size="sm" />}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};

export default DeleteDialog;

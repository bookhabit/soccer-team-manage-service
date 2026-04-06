export type AlertDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export type ConfirmDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

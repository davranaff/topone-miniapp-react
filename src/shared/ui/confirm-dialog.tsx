import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  danger?: boolean;
  loading?: boolean;
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}: ConfirmDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="liquid-glass-overlay fixed inset-0 z-50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2",
          "liquid-glass-surface-strong rounded-2xl p-6",
          "shadow-card data-[state=open]:animate-scale-in",
        )}
      >
        {icon && (
          <div
            className={cn(
              "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
              danger ? "liquid-glass-state-danger text-danger" : "liquid-glass-state-gold text-gold",
            )}
          >
            {icon}
          </div>
        )}

        <Dialog.Title className="text-center text-base font-semibold text-t-primary">
          {title}
        </Dialog.Title>

        {description && (
          <Dialog.Description className="mt-2 text-center text-sm text-t-muted">
            {description}
          </Dialog.Description>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button
            fullWidth
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelLabel}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

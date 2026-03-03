import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SheetModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  side?: "bottom" | "top";
  snapPoints?: boolean;
  className?: string;
  overlayClassName?: string;
};

export const SheetModal = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  side = "bottom",
  className,
  overlayClassName,
}: SheetModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in",
          overlayClassName,
        )}
      />
      <Dialog.Content
        className={cn(
          "fixed z-50 flex flex-col",
          "bg-elevated border border-border/60",
          "shadow-card",
          "data-[state=open]:animate-slide-up",
          side === "bottom" && [
            "bottom-0 left-0 right-0",
            "rounded-t-[1.5rem]",
            "max-h-[92dvh]",
            "pb-[env(safe-area-inset-bottom,0px)]",
          ],
          side === "top" && [
            "top-0 left-0 right-0",
            "rounded-b-[1.5rem]",
            "max-h-[80dvh]",
          ],
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <div className="mx-auto h-1 w-10 rounded-full bg-border/60 absolute top-3 left-1/2 -translate-x-1/2" />
          {title && (
            <Dialog.Title className="text-base font-semibold text-t-primary">
              {title}
            </Dialog.Title>
          )}
          <Dialog.Close asChild>
            <button
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-surface text-t-muted transition hover:text-t-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </div>

        {description && (
          <Dialog.Description className="shrink-0 px-5 pb-3 text-sm text-t-muted">
            {description}
          </Dialog.Description>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export const SheetModalTrigger = Dialog.Trigger;

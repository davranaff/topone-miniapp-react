import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

const statusChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium",
  {
    variants: {
      status: {
        active:   "bg-success/10 text-success border border-success/25",
        expired:  "bg-danger/10 text-danger border border-danger/25",
        pending:  "bg-gold/10 text-gold border border-gold/25",
        inactive: "bg-elevated text-t-muted border border-border/50",
        locked:   "bg-elevated text-t-muted border border-border/50",
        new:      "bg-info/10 text-info border border-info/25",
        trial:    "bg-gold/10 text-gold border border-gold/25",
        free:     "bg-elevated text-t-secondary border border-border/50",
        premium:  "bg-gold-135 text-t-inverse border border-transparent",
        completed:"bg-success/10 text-success border border-success/25",
        failed:   "bg-danger/10 text-danger border border-danger/25",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "active",
      size: "md",
    },
  },
);

const statusDot: Record<string, string> = {
  active:   "bg-success",
  expired:  "bg-danger",
  pending:  "bg-gold",
  inactive: "bg-t-muted",
  locked:   "bg-t-muted",
  new:      "bg-info",
  trial:    "bg-gold",
  free:     "bg-t-secondary",
  premium:  "bg-t-inverse",
  completed:"bg-success",
  failed:   "bg-danger",
};

type StatusChipProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusChipVariants> & {
    showDot?: boolean;
  };

export const StatusChip = ({
  className,
  status,
  size,
  showDot = true,
  children,
  ...props
}: StatusChipProps) => (
  <span className={cn(statusChipVariants({ status, size }), className)} {...props}>
    {showDot && (
      <span
        className={cn(
          "inline-block rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          status ? statusDot[status] : "bg-t-muted",
        )}
      />
    )}
    {children}
  </span>
);

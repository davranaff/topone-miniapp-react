import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

const statusChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium",
  {
    variants: {
      status: {
        active:   "liquid-glass-state-success text-success",
        expired:  "liquid-glass-state-danger text-danger",
        pending:  "liquid-glass-state-gold text-gold",
        inactive: "liquid-glass-chip text-t-muted",
        locked:   "liquid-glass-chip text-t-muted",
        new:      "liquid-glass-state-info text-info",
        trial:    "liquid-glass-state-gold text-gold",
        free:     "liquid-glass-chip text-t-secondary",
        premium:  "liquid-glass-accent text-t-inverse",
        completed:"liquid-glass-state-success text-success",
        failed:   "liquid-glass-state-danger text-danger",
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

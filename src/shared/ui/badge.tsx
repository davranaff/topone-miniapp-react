import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        gold:    "liquid-glass-state-gold text-gold",
        outline: "liquid-glass-chip text-t-secondary",
        success: "liquid-glass-state-success text-success",
        danger:  "liquid-glass-state-danger text-danger",
        info:    "liquid-glass-state-info text-info",
        muted:   "liquid-glass-surface-muted text-t-muted",
        solid:   "liquid-glass-accent text-t-inverse",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
};

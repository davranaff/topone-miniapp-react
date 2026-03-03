import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        gold:    "border border-gold/30 bg-gold/10 text-gold",
        outline: "border border-border/60 bg-transparent text-t-secondary",
        success: "border border-success/30 bg-success/10 text-success",
        danger:  "border border-danger/30 bg-danger/10 text-danger",
        info:    "border border-info/30 bg-info/10 text-info",
        muted:   "border border-border/40 bg-elevated text-t-muted",
        solid:   "border-transparent bg-gold text-t-inverse",
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

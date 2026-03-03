import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type IconBadgeProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "gold" | "surface" | "success" | "danger" | "info" | "muted";
  glow?: boolean;
  shape?: "circle" | "rounded";
};

const sizeMap = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-14 w-14 text-xl",
};

const variantMap = {
  gold:    "bg-gold/15 text-gold border border-gold/25",
  surface: "bg-elevated text-t-secondary border border-border/50",
  success: "bg-success/10 text-success border border-success/25",
  danger:  "bg-danger/10 text-danger border border-danger/25",
  info:    "bg-info/10 text-info border border-info/25",
  muted:   "bg-elevated text-t-muted border border-border/40",
};

export const IconBadge = ({
  icon,
  size = "md",
  variant = "gold",
  glow = false,
  shape = "rounded",
  className,
  ...props
}: IconBadgeProps) => (
  <div
    className={cn(
      "inline-flex shrink-0 items-center justify-center",
      sizeMap[size],
      variantMap[variant],
      shape === "circle" ? "rounded-full" : "rounded-xl",
      glow && "shadow-glow-sm",
      className,
    )}
    {...props}
  >
    {icon}
  </div>
);

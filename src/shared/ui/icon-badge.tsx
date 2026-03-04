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
  gold:    "liquid-glass-state-gold text-gold",
  surface: "liquid-glass-chip text-t-secondary",
  success: "liquid-glass-state-success text-success",
  danger:  "liquid-glass-state-danger text-danger",
  info:    "liquid-glass-state-info text-info",
  muted:   "liquid-glass-surface-muted text-t-muted",
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

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FloatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label?: string;
  position?: "br" | "bl" | "tr" | "tl" | "bc";
  size?: "sm" | "md" | "lg";
  variant?: "gold" | "surface" | "danger";
  badge?: number;
};

const posMap = {
  br: "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4",
  bl: "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-4",
  tr: "fixed top-4 right-4",
  tl: "fixed top-4 left-4",
  bc: "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2",
};

const sizeMap = { sm: "h-11 w-11 text-sm", md: "h-14 w-14 text-base", lg: "h-16 w-16 text-xl" };
const variantMap = {
  gold:    "bg-gold-135 text-t-inverse shadow-glow hover:shadow-glow-lg",
  surface: "bg-elevated border border-border/60 text-t-primary shadow-card",
  danger:  "bg-danger text-white shadow-soft",
};

export const FloatingButton = ({
  icon,
  label,
  position = "br",
  size = "md",
  variant = "gold",
  badge,
  className,
  ...props
}: FloatingButtonProps) => (
  <button
    aria-label={label}
    className={cn(
      "relative z-40 flex items-center justify-center rounded-full",
      "transition-all duration-200 active:scale-95",
      posMap[position],
      sizeMap[size],
      variantMap[variant],
      className,
    )}
    {...props}
  >
    {icon}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-2xs font-bold text-white">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </button>
);

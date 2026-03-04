import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: boolean;
  goldBorder?: boolean;
  interactive?: boolean;
  radius?: "lg" | "xl" | "2xl";
};

const padMap = { none: "", sm: "p-3", md: "p-4", lg: "p-5 md:p-6" };
const radMap = { lg: "rounded-xl", xl: "rounded-2xl", "2xl": "rounded-[1.5rem]" };

export const GlassCard = ({
  children,
  className,
  padding = "md",
  glow = false,
  goldBorder = false,
  interactive = false,
  radius = "xl",
  style,
  ...props
}: GlassCardProps) => (
  <div
    className={cn(
      "glass-premium relative overflow-hidden",
      "shadow-card",
      radMap[radius],
      padMap[padding],
      glow && "shadow-glow",
      interactive && [
        "cursor-pointer transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]",
        "active:scale-[0.985] active:translate-y-0",
      ],
      className,
    )}
    style={goldBorder ? { ...style, borderColor: "rgba(212, 160, 23, 0.3)" } : style}
    {...props}
  >
    {children}
  </div>
);

export const GlassCardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-3 flex items-start justify-between gap-2", className)} {...props}>
    {children}
  </div>
);

export const GlassCardTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-base font-semibold text-t-primary leading-snug", className)}
    {...props}
  >
    {children}
  </h3>
);

export const GlassCardSubtitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-t-muted", className)} {...props}>
    {children}
  </p>
);

export const GlassCardFooter = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

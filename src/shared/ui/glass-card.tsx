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
  ...props
}: GlassCardProps) => (
  <div
    className={cn(
      "glass-premium shine-sweep relative overflow-hidden",
      "border border-white/10 bg-[linear-gradient(180deg,rgba(34,28,18,0.58),rgba(18,18,18,0.76),rgba(10,10,10,0.84))]",
      "shadow-card before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
      "after:pointer-events-none after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-white/6",
      radMap[radius],
      padMap[padding],
      glow && "shadow-glow",
      goldBorder && "border-gold/30",
      interactive && [
        "cursor-pointer transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]",
        "active:scale-[0.985] active:translate-y-0",
      ],
      className,
    )}
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

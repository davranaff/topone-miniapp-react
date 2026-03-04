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
      "glass-lg relative overflow-hidden",
      "border border-white/10 bg-[linear-gradient(180deg,rgba(28,28,28,0.9),rgba(16,16,16,0.76))]",
      "shadow-card before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/10",
      radMap[radius],
      padMap[padding],
      glow && "shadow-glow",
      goldBorder && "border-gold/30",
      interactive && [
        "cursor-pointer transition-all duration-200",
        "hover:border-gold/40 hover:shadow-glow-sm hover:-translate-y-0.5",
        "active:scale-[0.98] active:translate-y-0",
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

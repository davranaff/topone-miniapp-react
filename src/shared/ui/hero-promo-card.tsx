import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

type HeroPromoCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  cta?: string;
  onCta?: () => void;
  trailing?: ReactNode;
  gradient?: "gold" | "dark" | "custom";
  gradientClass?: string;
  className?: string;
};

export const HeroPromoCard = ({
  title,
  subtitle,
  badge,
  cta,
  onCta,
  trailing,
  gradient = "gold",
  gradientClass,
  className,
}: HeroPromoCardProps) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl p-5",
      gradient === "gold" &&
        "liquid-glass-surface-strong border-gold/25 bg-gradient-to-br from-[#2a1f00] via-[#1a1200] to-[#0a0a0a]",
      gradient === "dark" &&
        "liquid-glass-surface-strong",
      gradient === "custom" && gradientClass,
      className,
    )}
  >
    {gradient === "gold" && (
      <>
        <div
          data-glow
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/15 blur-2xl"
        />
        <div className="pointer-events-none absolute -bottom-6 left-8 h-20 w-20 rounded-full bg-gold/10 blur-xl" />
      </>
    )}

    <div className="relative flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        {badge && (
          <span className="liquid-glass-state-gold inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-gold">
            {badge}
          </span>
        )}
        <h3 className="text-base font-bold leading-snug text-t-primary">{title}</h3>
        {subtitle && <p className="text-sm text-t-secondary">{subtitle}</p>}
        {cta && (
          <Button size="sm" variant="primary" onClick={onCta} className="mt-1">
            {cta}
          </Button>
        )}
      </div>

      {trailing && (
        <div className="shrink-0">{trailing}</div>
      )}
    </div>
  </div>
);

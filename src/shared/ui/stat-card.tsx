import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { GlassCard } from "@/shared/ui/glass-card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: string;
  deltaPositive?: boolean;
  suffix?: string;
  highlight?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export const StatCard = ({
  label,
  value,
  icon,
  delta,
  deltaPositive = true,
  suffix,
  highlight = false,
  className,
  size = "md",
}: StatCardProps) => (
  <GlassCard
    className={cn("flex flex-col gap-1", className)}
    goldBorder={highlight}
    glow={highlight}
    padding={size === "sm" ? "sm" : "md"}
  >
    <div className="flex items-start justify-between gap-2">
      <span className={cn("text-xs font-medium text-t-muted", size === "sm" && "text-2xs")}>
        {label}
      </span>
      {icon && (
        <span className="shrink-0 text-gold">{icon}</span>
      )}
    </div>

    <div className="flex items-end gap-1 leading-none">
      <span
        className={cn(
          "font-bold text-t-primary",
          highlight ? "text-gold-gradient" : "",
          size === "sm" ? "text-lg" : "text-2xl",
        )}
      >
        {value}
      </span>
      {suffix && (
        <span className="mb-0.5 text-xs text-t-muted">{suffix}</span>
      )}
    </div>

    {delta && (
      <span
        className={cn(
          "text-2xs font-medium",
          deltaPositive ? "text-success" : "text-danger",
        )}
      >
        {deltaPositive ? "↑" : "↓"} {delta}
      </span>
    )}
  </GlassCard>
);

type StatCardsRowProps = {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
};

export const StatCardsRow = ({ stats, columns = 2, className }: StatCardsRowProps) => (
  <div
    className={cn(
      "grid gap-3",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-2 sm:grid-cols-4",
      className,
    )}
  >
    {stats.map((stat, i) => (
      <StatCard key={i} {...stat} />
    ))}
  </div>
);

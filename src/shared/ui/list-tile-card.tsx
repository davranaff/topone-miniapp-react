import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ListTileCardProps = HTMLAttributes<HTMLDivElement> & {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  interactive?: boolean;
  locked?: boolean;
  highlight?: boolean;
};

export const ListTileCard = ({
  leading,
  title,
  subtitle,
  trailing,
  interactive = false,
  locked = false,
  highlight = false,
  className,
  ...props
}: ListTileCardProps) => (
  <div
    className={cn(
      "liquid-glass-surface liquid-glass-surface-interactive flex items-center gap-3 rounded-xl px-4 py-3.5",
      "transition-all duration-200",
      interactive && [
        "cursor-pointer",
        "hover:border-gold/30",
        "active:scale-[0.98]",
      ],
      highlight && "liquid-glass-state-gold",
      locked && "opacity-60",
      className,
    )}
    {...props}
  >
    {leading && (
      <div className="shrink-0">
        {leading}
      </div>
    )}

    <div className="min-w-0 flex-1">
      <p className={cn(
        "truncate text-sm font-medium text-t-primary",
        locked && "text-t-muted",
      )}>
        {title}
      </p>
      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-t-muted">{subtitle}</p>
      )}
    </div>

    {trailing && (
      <div className="shrink-0 text-t-muted">{trailing}</div>
    )}
  </div>
);

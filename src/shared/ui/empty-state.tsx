import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
};

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "gap-3 py-8" : "gap-4 py-14",
      className,
    )}
  >
    {icon && (
      <div
        className={cn(
          "liquid-glass-surface-muted flex items-center justify-center rounded-2xl text-t-muted",
          compact ? "h-12 w-12 text-xl" : "h-16 w-16 text-3xl",
        )}
      >
        {icon}
      </div>
    )}

    <div className="space-y-1.5 max-w-[260px]">
      <p className={cn("font-semibold text-t-primary", compact ? "text-sm" : "text-base")}>
        {title}
      </p>
      {description && (
        <p className={cn("text-t-muted", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
    </div>

    {action && (
      <Button
        variant="outline"
        size={compact ? "sm" : "md"}
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    )}
  </div>
);

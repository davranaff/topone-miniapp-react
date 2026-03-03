import * as RadixProgress from "@radix-ui/react-progress";
import { cn } from "@/shared/lib/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  variant?: "gold" | "success" | "info" | "danger";
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  label?: string;
  className?: string;
  trackClassName?: string;
};

const trackHeight = { xs: "h-1", sm: "h-1.5", md: "h-2" };
const indicatorColor = {
  gold:    "bg-gold-135",
  success: "bg-success",
  info:    "bg-info",
  danger:  "bg-danger",
};

export const ProgressBar = ({
  value,
  max = 100,
  variant = "gold",
  size = "sm",
  showLabel = false,
  label,
  className,
  trackClassName,
}: ProgressBarProps) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-t-muted">
          {label && <span>{label}</span>}
          {showLabel && <span className="ml-auto text-gold font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <RadixProgress.Root
        value={value}
        max={max}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-elevated",
          trackHeight[size],
          trackClassName,
        )}
      >
        <RadixProgress.Indicator
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            indicatorColor[variant],
          )}
          style={{ width: `${pct}%` }}
        />
      </RadixProgress.Root>
    </div>
  );
};

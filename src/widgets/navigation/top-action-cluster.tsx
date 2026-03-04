import type { ReactNode } from "react";
import { Bell, Settings, Star, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { formatCompactNumber } from "@/shared/lib/number";
import { useLocale } from "@/shared/hooks/use-locale";

type TopActionClusterProps = {
  coins?: number;
  stars?: number;
  unreadNotifications?: number;
  className?: string;
};

const ClusterButton = ({
  onClick,
  badge,
  children,
  "aria-label": ariaLabel,
}: {
  onClick?: () => void;
  badge?: number;
  children: ReactNode;
  "aria-label"?: string;
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      "relative flex h-9 w-9 items-center justify-center rounded-xl",
      "border border-border/50 bg-elevated text-t-muted",
      "transition-all duration-200 hover:border-gold/30 hover:text-t-primary",
      "active:scale-90",
    )}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);

const StatsChip = ({
  coins,
  stars,
  onClick,
}: {
  coins?: number;
  stars?: number;
  onClick?: () => void;
}) => {
  const { locale } = useLocale();

  return (
  <button
    onClick={onClick}
    className={cn(
      "flex h-9 items-center gap-2 rounded-full px-3",
      "border border-border/50 bg-elevated text-t-primary transition-all duration-200",
      "hover:border-gold/30 active:scale-95",
    )}
  >
    <div className="flex items-center gap-1 text-[11px] font-bold tabular-nums text-t-primary">
      <CircleDollarSign className="h-3.5 w-3.5 text-gold" />
      <span>{formatCompactNumber(coins ?? 0, locale)}</span>
    </div>
    <span className="h-3.5 w-px bg-border/60" />
    <div className="flex items-center gap-1 text-[11px] font-bold tabular-nums text-t-primary">
      <Star className="h-3.5 w-3.5 text-gold" />
      <span>{formatCompactNumber(stars ?? 0, locale)}</span>
    </div>
  </button>
  );
};

export const TopActionCluster = ({
  coins,
  stars,
  unreadNotifications = 0,
  className,
}: TopActionClusterProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatsChip
        coins={coins}
        stars={stars}
        onClick={() => navigate("/transactions/coins")}
      />
      <ClusterButton
        onClick={() => navigate("/notifications")}
        badge={unreadNotifications}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </ClusterButton>
      <ClusterButton
        onClick={() => navigate("/settings")}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </ClusterButton>
    </div>
  );
};

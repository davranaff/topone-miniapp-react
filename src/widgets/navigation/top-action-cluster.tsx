import type { ReactNode } from "react";
import { Bell, Settings, Star, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

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

const StatPill = ({
  icon,
  value,
  color,
  onClick,
}: {
  icon: ReactNode;
  value: number | undefined;
  color: "gold" | "blue";
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex h-8 items-center gap-1 rounded-lg px-2.5",
      "border transition-all duration-200 active:scale-95",
      color === "gold"
        ? "border-gold/20 bg-gold/10 text-gold hover:border-gold/40"
        : "border-info/20 bg-info/10 text-info hover:border-info/40",
    )}
  >
    <span className="text-sm">{icon}</span>
    <span className="text-xs font-semibold tabular-nums">
      {value !== undefined ? value.toLocaleString() : "—"}
    </span>
  </button>
);

export const TopActionCluster = ({
  coins,
  stars,
  unreadNotifications = 0,
  className,
}: TopActionClusterProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatPill
        icon={<Star className="h-3.5 w-3.5" />}
        value={stars}
        color="gold"
        onClick={() => navigate("/transactions/xp")}
      />
      <StatPill
        icon={<CircleDollarSign className="h-3.5 w-3.5" />}
        value={coins}
        color="blue"
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

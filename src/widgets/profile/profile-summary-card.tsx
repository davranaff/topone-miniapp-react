import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { UserProfile } from "@/entities/user/types";
import { Avatar } from "@/shared/ui/avatar";
import { StatusChip } from "@/shared/ui/status-chip";
import { cn } from "@/shared/lib/cn";

export const ProfileSummaryCard = ({ profile }: { profile: UserProfile }) => {
  const isPremium = profile.hasActiveSubscription;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;

  return (
    <Link to="/profile">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200",
          "hover:border-gold/40 active:scale-[0.98]",
          isPremium
            ? "border-gold/25 bg-gradient-to-r from-[#1a1200] to-[#0d0d0d]"
            : "border-border/50 bg-elevated",
        )}
      >
        <Avatar
          src={profile.avatarUrl}
          fallback={fullName}
          size="md"
          gold={isPremium}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-t-primary">{fullName}</p>
            {isPremium && (
              <StatusChip status="premium" size="sm" showDot={false}>
                Premium
              </StatusChip>
            )}
          </div>
          <p className="truncate text-xs text-t-muted">@{profile.username}</p>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-t-muted" />
      </div>
    </Link>
  );
};

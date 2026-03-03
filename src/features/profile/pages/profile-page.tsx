import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, CreditCard, Bell, Shield } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { Avatar } from "@/shared/ui/avatar";
import { StatusChip } from "@/shared/ui/status-chip";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { cn } from "@/shared/lib/cn";

const MenuItem = ({
  icon,
  label,
  to,
  danger,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  to?: string;
  danger?: boolean;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-98",
        "hover:bg-elevated",
        danger ? "text-danger" : "text-t-secondary",
      )}
      onClick={() => { onClick?.(); if (to) navigate(to); }}
    >
      <span className={cn("shrink-0", danger ? "text-danger" : "text-gold")}>{icon}</span>
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {!danger && <ChevronRight className="h-4 w-4 text-t-muted" />}
    </button>
  );
};

export const ProfilePage = () => {
  const profile = useProfile();
  const logout = useLogout();
  const navigate = useNavigate();

  if (profile.isLoading) {
    return (
      <MobileScreen>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-20 w-20 rounded-full bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <div className="h-5 w-32 rounded-lg bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </MobileScreen>
    );
  }

  if (!profile.data) return null;

  const { data } = profile;
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.username;
  const isPremium = data.hasActiveSubscription;

  return (
    <MobileScreen>
      <PageHeader title="Profil" />

      {/* ---- Avatar header ---- */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Avatar src={data.avatarUrl} fallback={fullName} size="xl" gold={isPremium} />
        <div className="text-center">
          <p className="text-base font-bold text-t-primary">{fullName}</p>
          <p className="text-sm text-t-muted">@{data.username}</p>
        </div>
        {isPremium && <StatusChip status="premium" showDot>Premium</StatusChip>}
      </div>

      <div className="space-y-4">
        {/* ---- Edit form ---- */}
        <GlassCard>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-t-muted">Ma'lumotlarni tahrirlash</p>
          <ProfileForm profile={data} />
        </GlassCard>

        {/* ---- Menu ---- */}
        <GlassCard padding="none">
          <div className="divide-y divide-border/40">
            <MenuItem icon={<CreditCard className="h-4 w-4" />} label="Obuna" to="/subscription" />
            <MenuItem icon={<Bell className="h-4 w-4" />} label="Bildirishnomalar" to="/notifications" />
            <MenuItem icon={<Shield className="h-4 w-4" />} label="Xavfsizlik" to="/settings" />
          </div>
        </GlassCard>

        {/* ---- Logout ---- */}
        <GlassCard padding="none">
          <MenuItem
            icon={<LogOut className="h-4 w-4" />}
            label="Chiqish"
            danger
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          />
        </GlassCard>
      </div>
    </MobileScreen>
  );
};

import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  ChevronRight,
  CreditCard,
  Globe,
  Mail,
  Shield,
  ShieldCheck,
  UserRoundCheck,
  UserSquare2,
  WalletCards,
} from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { StatusChip } from "@/shared/ui/status-chip";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { cn } from "@/shared/lib/cn";

const MenuItem = ({
  icon,
  label,
  description,
  to,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  to?: string;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <button
      className={cn(
        "liquid-glass-button-chip liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-3 py-3 text-t-secondary transition-all active:scale-98",
      )}
      onClick={() => { onClick?.(); if (to) navigate(to); }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-gold/15 bg-gold/10 text-gold">
        {icon}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-t-muted">{description}</span>}
      </span>
      <ChevronRight className="h-4 w-4 text-t-muted" />
    </button>
  );
};

const InfoPill = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="liquid-glass-surface-muted rounded-[1.15rem] px-3 py-3">
    <div className="mb-1 flex items-center gap-2 text-t-muted">
      <span className="text-gold">{icon}</span>
      <span className="text-[11px] uppercase tracking-[0.14em]">{label}</span>
    </div>
    <p className="truncate text-sm font-semibold text-t-primary">{value}</p>
  </div>
);

export const ProfilePage = () => {
  const profile = useProfile();

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
  const joinedLabel = data.joinedAt ? new Date(data.joinedAt).toLocaleDateString() : "Yaqinda qo'shilgan";
  const membershipLabel = isPremium ? "Premium a'zo" : "Standard a'zo";
  const securityLabel = data.hasPassword ? "Parol faol" : "Parol o'rnatilmagan";

  return (
    <MobileScreen className="space-y-4">
      <PageHeader title="Profil" subtitle={membershipLabel} />

      <GlassCard padding="none" className="relative overflow-hidden rounded-[2rem]">
        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <Avatar src={data.avatarUrl} fallback={fullName} size="xl" gold={isPremium} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isPremium && <StatusChip status="premium" showDot>Premium</StatusChip>}
                {!isPremium && <Badge variant="outline" size="sm">Account</Badge>}
                {data.roles[0] && (
                  <Badge variant="muted" size="sm">{data.roles[0]}</Badge>
                )}
              </div>

              <p className="mt-3 text-[1.2rem] font-extrabold tracking-[-0.03em] text-t-primary">{fullName}</p>
              <p className="mt-1 text-sm text-t-muted">@{data.username}</p>
              <p className="mt-2 text-sm leading-6 text-t-secondary">
                Profil ma'lumotlari, obuna holati va referral statistikasi shu sahifada ko'rinadi.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <InfoPill icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={data.email} />
            <InfoPill icon={<Globe className="h-3.5 w-3.5" />} label="Timezone" value={data.timezone} />
            <InfoPill icon={<CalendarClock className="h-3.5 w-3.5" />} label="Joined" value={joinedLabel} />
            <InfoPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Security" value={securityLabel} />
          </div>
        </div>
      </GlassCard>

      <StatCardsRow
        columns={3}
        stats={[
          {
            label: "Plan",
            value: isPremium ? "PRO" : "FREE",
            icon: <CreditCard className="h-4 w-4" />,
            highlight: isPremium,
          },
          {
            label: "Roles",
            value: data.roles.length || 1,
            icon: <UserRoundCheck className="h-4 w-4" />,
          },
          {
            label: "Security",
            value: data.hasPassword ? "ON" : "SET",
            icon: <Shield className="h-4 w-4" />,
          },
        ]}
      />

      <GlassCard padding="none" className="rounded-[1.8rem]">
        <div className="space-y-1 p-1.5">
          <MenuItem
            icon={<UserSquare2 className="h-4 w-4" />}
            label="Akkaunt ma'lumotlari"
            description="Shaxsiy ma'lumotlar va parolni yangilash"
            to="/account"
          />
          <MenuItem
            icon={<WalletCards className="h-4 w-4" />}
            label="Obuna"
            description="Reja va premium imkoniyatlarni boshqarish"
            to="/subscription"
          />
          <MenuItem
            icon={<CreditCard className="h-4 w-4" />}
            label="Referallar"
            description="Takliflar va bonus tarixini ko'rish"
            to="/referrals"
          />
        </div>
      </GlassCard>
    </MobileScreen>
  );
};

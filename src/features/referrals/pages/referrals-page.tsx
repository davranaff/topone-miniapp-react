import { useState } from "react";
import { Users, Copy, CheckCircle2, TrendingUp, Wallet, Award } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { useReferralStats, useReferralHistory, useReferralLevels } from "@/features/referrals/hooks/use-referrals";

export const ReferralsPage = () => {
  const [copied, setCopied] = useState(false);
  const stats = useReferralStats();
  const history = useReferralHistory();
  const levels = useReferralLevels();

  const handleCopy = () => {
    if (stats.data?.referralUrl) {
      void navigator.clipboard.writeText(stats.data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (stats.isLoading || history.isLoading || levels.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (stats.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => stats.refetch()} />
      </MobileScreen>
    );
  }

  const data = stats.data!;
  const historyItems = history.data ?? [];
  const levelItems = levels.data ?? [];

  return (
    <MobileScreen>
      <PageHeader title="Referallar" subtitle="Do'stlaringizni taklif qiling va bonus oling" backButton />

      <MobileScreenSection className="mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="text-center">
            <Users className="mx-auto h-5 w-5 text-gold mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.totalReferrals}</p>
            <p className="text-2xs text-t-muted">Jami referallar</p>
          </GlassCard>
          <GlassCard className="text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-success mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.activeReferrals}</p>
            <p className="text-2xs text-t-muted">Faol</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Wallet className="mx-auto h-5 w-5 text-info mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.availableBalance.toLocaleString()}</p>
            <p className="text-2xs text-t-muted">Balans</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Award className="mx-auto h-5 w-5 text-gold mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.totalEarnings.toLocaleString()}</p>
            <p className="text-2xs text-t-muted">Jami daromad</p>
          </GlassCard>
        </div>

        {/* Referral Link */}
        <GlassCard goldBorder>
          <p className="text-xs font-semibold uppercase tracking-wider text-t-muted mb-2">
            Sizning referal havolangiz
          </p>
          <div className="rounded-lg border border-border/60 bg-surface px-3 py-2">
            <p className="truncate text-sm font-mono text-gold">
              {data.referralUrl || `https://t.me/TopOneBot?start=${data.referralCode}`}
            </p>
          </div>
          <Button
            fullWidth
            variant={copied ? "success" : "outline"}
            className="mt-3"
            onClick={handleCopy}
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Nusxa olindi!" : "Nusxa ko'chirish"}
          </Button>
        </GlassCard>

        {/* History */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">
            Taklif qilinganlar ({historyItems.length})
          </p>
          {history.isError ? (
            <GlassCard className="rounded-[1.2rem] border-danger/20">
              <p className="text-sm text-t-secondary">Referral tarixini yuklab bo'lmadi.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => history.refetch()}>
                Qayta urinish
              </Button>
            </GlassCard>
          ) : historyItems.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="Hali referal yo'q"
              description="Do'stlaringizni taklif qiling va bonuslar oling."
            />
          ) : (
            <div className="space-y-2">
              {historyItems.map((item) => (
                <GlassCard key={item.id}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-elevated text-sm">
                      👤
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-t-primary">@{item.username}</p>
                      <p className="text-xs text-t-muted">
                        {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString("uz") : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={item.isActive ? "success" : "muted"} size="sm">
                        {item.isActive ? "Faol" : "Passiv"}
                      </Badge>
                      {item.earnedAmount > 0 && (
                        <span className="text-xs font-semibold text-gold">
                          +{item.earnedAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Levels */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">
            Referal darajalari ({levelItems.length})
          </p>
          {levels.isError ? (
            <GlassCard className="rounded-[1.2rem] border-danger/20">
              <p className="text-sm text-t-secondary">Darajalarni yuklab bo'lmadi.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => levels.refetch()}>
                Qayta urinish
              </Button>
            </GlassCard>
          ) : levelItems.length === 0 ? (
            <EmptyState
              icon={<Award className="h-8 w-8" />}
              title="Darajalar topilmadi"
              description="Referral level ma'lumotlari keyinroq paydo bo'lishi mumkin."
            />
          ) : (
            <div className="space-y-2">
              {levelItems.map((level) => {
                const unlocked = level.isUnlocked || data.totalReferrals >= level.minReferrals;

                return (
                  <GlassCard key={level.id || `${level.level}-${level.minReferrals}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-t-primary">{level.name || `Level ${level.level}`}</p>
                        <p className="text-xs text-t-muted">
                          {level.minReferrals}+ referral • {level.rewardPercentage}% bonus
                        </p>
                      </div>
                      <Badge variant={unlocked ? "success" : "muted"} size="sm">
                        {unlocked ? "Ochilgan" : "Yopiq"}
                      </Badge>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </MobileScreenSection>
    </MobileScreen>
  );
};

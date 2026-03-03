import { Users, Copy } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

export const ReferralsPage = () => {
  const referralLink = "https://t.me/TopOneBot?start=ref_placeholder";

  const handleCopy = () => {
    void navigator.clipboard.writeText(referralLink);
  };

  return (
    <MobileScreen>
      <PageHeader title="Referallar" subtitle="Do'stlaringizni taklif qiling" backButton />

      <MobileScreenSection className="mt-4">
        <GlassCard goldBorder>
          <p className="text-xs font-semibold uppercase tracking-wider text-t-muted mb-2">
            Sizning referal havolangiz
          </p>
          <p className="truncate text-sm font-mono text-gold">{referralLink}</p>
          <Button fullWidth variant="outline" className="mt-3" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            Nusxa ko'chirish
          </Button>
        </GlassCard>

        <div className="mt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">
            Taklif qilinganlar
          </p>
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Hali referal yo'q"
            description="Do'stlaringizni taklif qiling va bonuslar oling."
          />
        </div>
      </MobileScreenSection>
    </MobileScreen>
  );
};

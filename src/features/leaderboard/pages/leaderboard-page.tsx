import { BarChart3 } from "lucide-react";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";

export const LeaderboardPage = () => (
  <MobileScreen>
    <PageHeader title="Liderlar" subtitle="Top foydalanuvchilar reytingi" />
    <div className="mt-10">
      <EmptyState
        icon={<BarChart3 className="h-8 w-8" />}
        title="Reyting tez kunda"
        description="Leaderboard tizimi ishlab chiqilmoqda."
      />
    </div>
  </MobileScreen>
);

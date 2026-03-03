import { Trophy } from "lucide-react";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";

export const AchievementsPage = () => (
  <MobileScreen>
    <PageHeader title="Yutuqlar" subtitle="O'z natijalaringizni kuzating" />
    <div className="mt-10">
      <EmptyState
        icon={<Trophy className="h-8 w-8" />}
        title="Yutuqlar tez kunda"
        description="Gamification tizimi ishlab chiqilmoqda."
      />
    </div>
  </MobileScreen>
);

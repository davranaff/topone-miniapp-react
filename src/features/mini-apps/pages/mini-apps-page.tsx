import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMiniAppsList } from "@/features/mini-apps/hooks/use-mini-apps-list";
import { MiniAppCard } from "@/widgets/mini-apps/mini-app-card";
import { MiniAppsEmptyState } from "@/features/mini-apps/components/mini-apps-empty-state";
import { MobileScreen } from "@/shared/ui/mobile-screen";

export const MiniAppsPage = () => {
  const miniApps = useMiniAppsList();

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Мини-аппы" subtitle="Bridge boundary для Telegram runtime и web mode." />
      {miniApps.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      ) : null}
      {!miniApps.isLoading && !miniApps.data?.length ? <MiniAppsEmptyState /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {miniApps.data?.map((app) => (
          <Link key={app.id} to={`/mini-apps/${app.slug}`}>
            <MiniAppCard app={app} />
          </Link>
        ))}
      </div>
    </MobileScreen>
  );
};

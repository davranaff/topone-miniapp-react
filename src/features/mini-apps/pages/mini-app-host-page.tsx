import { useParams } from "react-router-dom";
import { PageHeader } from "@/shared/ui/page-header";
import { Badge } from "@/shared/ui/badge";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { useMiniAppDetail } from "@/features/mini-apps/hooks/use-mini-app-detail";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { GlassCard } from "@/shared/ui/glass-card";

export const MiniAppHostPage = () => {
  const { slug } = useParams();
  const telegram = useTelegram();
  const app = useMiniAppDetail(slug);

  if (!app.data) {
    return null;
  }

  const canEmbed = app.data.appUrl.startsWith("http://") || app.data.appUrl.startsWith("https://");

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title={app.data.name} subtitle={app.data.description} />
      <GlassCard className="rounded-[1.6rem] border-border/45 p-6">
        <div className="flex flex-wrap gap-3">
          <Badge>{telegram.isAvailable() ? "Telegram runtime" : "Browser runtime"}</Badge>
          <Badge>{app.data.category}</Badge>
        </div>

        {canEmbed ? (
          <iframe
            className="mt-6 h-[66vh] w-full rounded-lg border border-border bg-white xl:h-[72vh]"
            src={app.data.appUrl}
            title={app.data.name}
          />
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
            Этот mini-app сейчас ссылается на asset bundle из Flutter (`{app.data.appUrl}`). Для web-версии сюда можно подключить iframe URL или локальную public-сборку без изменений в router и state layer.
          </div>
        )}
      </GlassCard>
    </MobileScreen>
  );
};

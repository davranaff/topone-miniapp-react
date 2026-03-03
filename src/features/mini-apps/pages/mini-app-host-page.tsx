import { useParams } from "react-router-dom";
import { PageHeader } from "@/shared/ui/page-header";
import { Badge } from "@/shared/ui/badge";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { useMiniAppDetail } from "@/features/mini-apps/hooks/use-mini-app-detail";

export const MiniAppHostPage = () => {
  const { slug } = useParams();
  const telegram = useTelegram();
  const app = useMiniAppDetail(slug);

  if (!app.data) {
    return null;
  }

  const canEmbed = app.data.appUrl.startsWith("http://") || app.data.appUrl.startsWith("https://");

  return (
    <div className="space-y-6">
      <PageHeader title={app.data.name} subtitle={app.data.description} />
      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap gap-3">
          <Badge>{telegram.isAvailable() ? "Telegram runtime" : "Browser runtime"}</Badge>
          <Badge>{app.data.category}</Badge>
        </div>

        {canEmbed ? (
          <iframe
            className="mt-6 h-[70vh] w-full rounded-lg border border-border bg-white"
            src={app.data.appUrl}
            title={app.data.name}
          />
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
            Этот mini-app сейчас ссылается на asset bundle из Flutter (`{app.data.appUrl}`). Для web-версии сюда можно подключить iframe URL или локальную public-сборку без изменений в router и state layer.
          </div>
        )}
      </section>
    </div>
  );
};

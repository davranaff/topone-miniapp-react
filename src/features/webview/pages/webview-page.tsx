import { useSearchParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";

export const WebViewPage = () => {
  const [params] = useSearchParams();
  const url = params.get("url") ?? "";
  const title = params.get("title") ?? "Sahifa";

  if (!url) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title={title} backButton sticky={false} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-t-muted">URL ko'rsatilmagan</p>
        </div>
      </MobileScreen>
    );
  }

  return (
    <div className="flex h-[var(--tg-viewport-height,100dvh)] flex-col bg-base">
      <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 xl:px-8">
        <PageHeader title={title} backButton sticky={false} className="flex-1 py-0" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-t-muted hover:text-t-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <iframe
        src={url}
        title={title}
        className="flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

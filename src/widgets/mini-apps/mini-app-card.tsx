import type { MiniApp } from "@/entities/mini-app/types";
import { Badge } from "@/shared/ui/badge";

export const MiniAppCard = ({ app }: { app: MiniApp }) => {
  return (
    <article className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card transition hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text">{app.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted">{app.description}</p>
        </div>
        <Badge>{app.category}</Badge>
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.16em] text-primary">Open bridge-ready host</p>
    </article>
  );
};

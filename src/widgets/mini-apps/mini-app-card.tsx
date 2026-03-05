import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { GlassCard } from "@/shared/ui/glass-card";
import { IconBadge } from "@/shared/ui/icon-badge";
import type { MiniApp } from "@/entities/mini-app/types";

export const MiniAppCard = ({ app }: { app: MiniApp }) => {
  const initials = app.name.slice(0, 2).toUpperCase();

  return (
    <Link to={`/mini-apps/${app.slug}`}>
      <GlassCard interactive>
        <div className="flex items-center gap-3">
          <IconBadge
            icon={<span className="text-xs font-bold">{initials}</span>}
            size="md"
            variant="gold"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-t-primary">{app.name}</h3>
            <Badge variant="muted" size="sm" className="mt-0.5 uppercase tracking-[0.08em]">{app.category}</Badge>
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-t-muted" />
        </div>
        {app.description && (
          <p className="mt-3 line-clamp-2 text-xs text-t-muted">{app.description}</p>
        )}
      </GlassCard>
    </Link>
  );
};

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, subtitle, actions, className }: PageHeaderProps) => {
  return (
    <header className={cn("flex flex-col gap-3 rounded-lg border border-border/60 bg-surface/90 p-6 shadow-card", className)}>
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    </header>
  );
};

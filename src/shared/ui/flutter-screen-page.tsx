import { Link } from "react-router-dom";
import { ArrowRight, FileCode2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export type FlutterScreenDescriptor = {
  title: string;
  description: string;
  feature: string;
  flutterSource: string;
  path: string;
  siblings?: Array<{ title: string; path: string }>;
};

export const FlutterScreenPage = ({
  title,
  description,
  feature,
  flutterSource,
  path,
  siblings = [],
}: FlutterScreenDescriptor) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={description}
        actions={
          <Badge className="w-fit">
            {feature}
          </Badge>
        }
      />

      <section className="rounded-[1.5rem] border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap gap-3">
          <Badge>Flutter parity shell</Badge>
          <Badge>{path}</Badge>
        </div>

        <div className="mt-5 rounded-xl border border-border/80 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <FileCode2 className="h-4 w-4 text-primary" />
            Flutter source
          </div>
          <p className="mt-2 font-mono text-xs text-muted">{flutterSource}</p>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">
          Этот экран уже перенесён в React как отдельный route target и привязан к feature-first архитектуре проекта.
          Следующий слой переноса для него: перенести контроллеры, data models, виджеты и действия из Flutter в локальный feature module.
        </p>
      </section>

      {siblings.length ? (
        <section className="rounded-[1.5rem] border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text">Sibling screens</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {siblings.map((item) => (
              <Link
                key={item.path}
                className="group flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 transition hover:border-primary/50 hover:bg-primary/5"
                to={item.path}
              >
                <span className="text-sm font-medium text-text">{item.title}</span>
                <ArrowRight className="h-4 w-4 text-muted transition group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-6">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Назад
          </Button>
        </div>
      </section>
    </div>
  );
};

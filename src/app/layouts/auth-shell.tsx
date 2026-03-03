import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AuthShell = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-screen bg-hero px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[2rem] border border-primary/20 bg-slate-950 px-10 py-12 text-slate-50 shadow-card lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              TopOne
            </span>
            <h1 className="max-w-md text-5xl font-semibold leading-tight">{t("title")}</h1>
            <p className="max-w-md text-sm text-slate-300">{t("subtitle")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">
              Feature-first architecture, Telegram runtime adapter, `react-query`, `axios`, `zustand` and a gold-first UI system.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-border/70 bg-surface/95 p-6 shadow-card md:p-8">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

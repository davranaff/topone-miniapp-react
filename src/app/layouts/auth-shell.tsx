import { Outlet } from "react-router-dom";

export const AuthShell = () => {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base px-4 py-8">
      <div
        data-glow
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/12 blur-3xl"
      />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-gold/6 blur-2xl" />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-2xs font-semibold uppercase tracking-widest text-gold">
            TopOne
          </span>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-elevated p-6 shadow-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

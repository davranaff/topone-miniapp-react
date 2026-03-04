import { Outlet } from "react-router-dom";

export const TelegramShell = () => {
  return (
    <div
      className="relative min-h-[var(--tg-viewport-height,100dvh)] overflow-hidden bg-base"
      style={{
        paddingTop: "var(--tg-safe-top, 0px)",
        paddingRight: "var(--tg-safe-right, 0px)",
        paddingBottom: "var(--tg-safe-bottom, 0px)",
        paddingLeft: "var(--tg-safe-left, 0px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,#000000_0%,#000000_80%,#2f1d03_92%,#7a4b0c_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(212,160,23,0.24),transparent_30%),radial-gradient(circle_at_78%_86%,rgba(180,123,29,0.2),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[repeating-linear-gradient(120deg,rgba(255,219,145,0.07)_0px,rgba(255,219,145,0.07)_2px,transparent_2px,transparent_16px)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#f5c842]/12 blur-[120px]" />

      <div className="relative min-h-[var(--tg-viewport-height,100dvh)]">
        <Outlet />
      </div>
    </div>
  );
};

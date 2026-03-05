import { Outlet } from "react-router-dom";

export const TelegramShell = () => {
  return (
    <div
      className="relative min-h-[var(--tg-viewport-height,100dvh)] overflow-hidden bg-base"
      style={{
        paddingTop: "calc(var(--tg-safe-top, 0px) + var(--tg-top-controls-offset, 0px))",
        paddingRight: "var(--tg-safe-right, 0px)",
        paddingBottom: "var(--tg-safe-bottom, 0px)",
        paddingLeft: "var(--tg-safe-left, 0px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 app-ambient-bg" />

      <div className="relative min-h-[var(--tg-viewport-height,100dvh)]">
        <Outlet />
      </div>
    </div>
  );
};

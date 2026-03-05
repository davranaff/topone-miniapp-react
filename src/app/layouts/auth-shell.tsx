import { Outlet, useLocation } from "react-router-dom";

export const AuthShell = () => {
  const location = useLocation();
  const isSplashRoute = location.pathname === "/" || location.pathname === "/splash";

  if (isSplashRoute) {
    return <Outlet />;
  }

  return (
    <div
      className="relative min-h-[var(--tg-viewport-height,100dvh)] overflow-hidden bg-base text-t-primary"
      style={{
        paddingTop: "calc(var(--tg-safe-top, 0px) + var(--tg-top-controls-offset, 0px))",
        paddingRight: "var(--tg-safe-right, 0px)",
        paddingBottom: "var(--tg-safe-bottom, 0px)",
        paddingLeft: "var(--tg-safe-left, 0px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 app-ambient-bg" />

      <div className="relative z-10 mx-auto flex min-h-[var(--tg-viewport-height,100dvh)] w-full max-w-[1520px] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </div>
    </div>
  );
};

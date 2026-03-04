import { Outlet, useLocation } from "react-router-dom";

export const AuthShell = () => {
  const location = useLocation();
  const isSplashRoute = location.pathname === "/" || location.pathname === "/splash";

  if (isSplashRoute) {
    return <Outlet />;
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#050301] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#050301_0%,#0d0904_38%,#181108_100%)]" />
      <div className="pointer-events-none absolute -left-24 -top-20 h-[20rem] w-[20rem] rounded-full bg-[#e6bc62]/18 blur-[88px]" />
      <div className="pointer-events-none absolute bottom-[-11rem] right-[-7rem] h-[21rem] w-[21rem] rounded-full bg-[#b67d19]/18 blur-[96px]" />
      <div className="pointer-events-none absolute left-1/2 top-[14%] h-48 w-[28rem] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6">
        <div className="relative w-full max-w-[34rem] overflow-hidden rounded-[2.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-[1px] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
          <div className="absolute inset-[1px] rounded-[calc(2.25rem-1px)] bg-[linear-gradient(145deg,rgba(41,29,12,0.42),rgba(10,8,4,0.78))]" />
          <div className="absolute inset-[1px] rounded-[calc(2.25rem-1px)] backdrop-blur-xl" />
          <div className="pointer-events-none absolute left-10 right-10 top-0 h-20 rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
          <div className="pointer-events-none absolute inset-y-10 left-0 w-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.035),transparent)]" />
          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

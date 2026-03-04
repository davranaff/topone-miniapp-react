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
      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6">
        <div className="relative w-full max-w-[34rem] overflow-hidden rounded-[2.25rem] bg-[rgba(255,255,255,0.06)] p-[1px] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
          <div className="absolute inset-[1px] rounded-[calc(2.25rem-1px)] bg-[linear-gradient(145deg,rgba(41,29,12,0.42),rgba(10,8,4,0.78))]" />
          <div className="absolute inset-[1px] rounded-[calc(2.25rem-1px)] backdrop-blur-xl" />
          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

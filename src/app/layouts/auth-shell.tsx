import { Outlet, useLocation } from "react-router-dom";
import { TopOneLogo } from "@/shared/ui/topone-logo";

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
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,#000000_0%,#000000_80%,#2f1d03_92%,#7a4b0c_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(212,160,23,0.24),transparent_30%),radial-gradient(circle_at_78%_86%,rgba(180,123,29,0.2),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[repeating-linear-gradient(120deg,rgba(255,219,145,0.07)_0px,rgba(255,219,145,0.07)_2px,transparent_2px,transparent_16px)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#f5c842]/12 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 top-[18%] hidden h-[28rem] w-[28rem] rounded-full bg-[#f5c842]/10 blur-[120px] xl:block" />
      <div className="pointer-events-none absolute -right-24 bottom-[10%] hidden h-[24rem] w-[24rem] rounded-full bg-[#d4a017]/10 blur-[120px] xl:block" />
      <div className="relative z-10 mx-auto flex min-h-[var(--tg-viewport-height,100dvh)] w-full max-w-[1520px] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="hidden xl:flex xl:w-[36rem] xl:shrink-0 xl:flex-col xl:gap-6">
          <div className="liquid-glass-surface-strong rounded-[2.2rem] border border-white/10 p-10">
            <TopOneLogo size="lg" />
            <p className="mt-6 text-4xl font-black tracking-[-0.035em] text-t-primary">
              TopOne Mini App
            </p>
            <p className="mt-3 max-w-[32rem] text-base leading-7 text-white/70">
              Desktop tajribasi uchun optimallashtirilgan kirish oqimi. Telegram va web rejimlari bir xil account bilan ishlaydi.
            </p>
          </div>
        </div>
        <div className="relative w-full max-w-[34rem] xl:ml-10 xl:max-w-[36rem]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

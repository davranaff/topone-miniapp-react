import { Outlet } from "react-router-dom";
import { BottomNav } from "@/widgets/navigation/bottom-nav";
import { TopNavbar } from "@/widgets/navigation/top-navbar";
import { ShellNavProvider } from "@/widgets/navigation/shell-nav";
import { NotificationsRealtimeProvider } from "@/features/notifications/realtime/notifications-realtime-provider";
import { RootPageHeaderProvider } from "@/shared/ui/page-header";

export const AppShell = () => {
  return (
    <NotificationsRealtimeProvider>
      <ShellNavProvider>
        <div
          className="relative min-h-[var(--tg-viewport-height,100dvh)] bg-base"
          style={{
            paddingTop: "calc(var(--tg-safe-top, 0px) + var(--tg-top-controls-offset, 0px))",
            paddingRight: "var(--tg-safe-right, 0px)",
            paddingBottom: "var(--tg-safe-bottom, 0px)",
            paddingLeft: "var(--tg-safe-left, 0px)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(155deg,#000000_0%,#000000_80%,#2f1d03_92%,#7a4b0c_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(212,160,23,0.24),transparent_30%),radial-gradient(circle_at_78%_86%,rgba(180,123,29,0.2),transparent_32%)]" />
            <div className="absolute inset-0 opacity-35 bg-[repeating-linear-gradient(120deg,rgba(255,219,145,0.07)_0px,rgba(255,219,145,0.07)_2px,transparent_2px,transparent_16px)]" />
            <div className="absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#f5c842]/12 blur-[120px]" />
            <div className="absolute -left-16 top-1/2 hidden h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-[#f5c842]/10 blur-[120px] lg:block" />
            <div className="absolute -right-24 top-[24%] hidden h-[24rem] w-[24rem] rounded-full bg-[#d4a017]/10 blur-[120px] lg:block" />
          </div>

          <TopNavbar />

          <div className="relative mx-auto w-full max-w-[1500px] px-2 sm:px-3 md:px-4 lg:px-6 xl:px-7">
            <main className="relative mx-auto min-h-[var(--tg-viewport-height,100dvh)] w-full max-w-lg md:max-w-[52rem] lg:max-w-[64rem] xl:max-w-[78rem] 2xl:max-w-[84rem]">
              <RootPageHeaderProvider>
                <Outlet />
              </RootPageHeaderProvider>
            </main>
          </div>
          <BottomNav />
        </div>
      </ShellNavProvider>
    </NotificationsRealtimeProvider>
  );
};

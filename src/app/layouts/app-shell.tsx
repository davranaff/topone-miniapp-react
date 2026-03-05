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
          <div className="pointer-events-none absolute inset-0 app-ambient-bg" />

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

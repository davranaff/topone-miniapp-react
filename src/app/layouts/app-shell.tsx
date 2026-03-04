import { Outlet } from "react-router-dom";
import { BottomNav } from "@/widgets/navigation/bottom-nav";
import { ShellNavProvider } from "@/widgets/navigation/shell-nav";

export const AppShell = () => {
  return (
    <ShellNavProvider>
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-base">
        <main className="relative mx-auto min-h-[100dvh] w-full max-w-lg">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </ShellNavProvider>
  );
};

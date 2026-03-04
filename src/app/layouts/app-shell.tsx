import { Outlet } from "react-router-dom";
import { BottomNav } from "@/widgets/navigation/bottom-nav";
import { ShellNavProvider } from "@/widgets/navigation/shell-nav";

export const AppShell = () => {
  return (
    <ShellNavProvider>
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-base">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.18),transparent_62%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[-20%] top-1/3 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-[-15%] h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

        <main className="relative mx-auto min-h-[100dvh] w-full max-w-lg">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </ShellNavProvider>
  );
};

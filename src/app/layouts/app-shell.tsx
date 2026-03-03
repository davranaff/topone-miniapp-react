import { Outlet } from "react-router-dom";
import { BottomNav } from "@/widgets/navigation/bottom-nav";

export const AppShell = () => {
  return (
    <div className="relative min-h-[100dvh] bg-base">
      <main className="mx-auto w-full max-w-lg">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

import { Outlet } from "react-router-dom";
import { TopBar } from "@/widgets/navigation/top-bar";
import { BottomNav } from "@/widgets/navigation/bottom-nav";

export const AppShell = () => {
  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 md:px-6">
        <TopBar />
        <main className="flex-1 py-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

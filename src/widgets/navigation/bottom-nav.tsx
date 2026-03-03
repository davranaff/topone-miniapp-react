import { Link, useLocation } from "react-router-dom";
import { Home, Layers3, UserRound, BookOpenText } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const items = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/courses", icon: BookOpenText, label: "Courses" },
  { to: "/mini-apps", icon: Layers3, label: "Mini Apps" },
  { to: "/profile", icon: UserRound, label: "Profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="sticky bottom-4 mt-8 rounded-full border border-border/70 bg-surface/95 p-2 shadow-card md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              className={cn(
                "flex flex-col items-center gap-1 rounded-full px-2 py-3 text-xs text-muted transition",
                isActive && "bg-primary text-slate-950",
              )}
              to={item.to}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

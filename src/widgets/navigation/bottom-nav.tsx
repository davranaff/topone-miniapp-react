import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpenText, Swords, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type NavItem = {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

const items: NavItem[] = [
  { to: "/home",       icon: Home,          label: "Asosiy" },
  { to: "/courses",   icon: BookOpenText,   label: "Kurslar" },
  { to: "/challenges",icon: Swords,         label: "Chellenj" },
  { to: "/stream-chat-list", icon: MessageCircle, label: "Chat" },
  { to: "/profile",   icon: UserRound,      label: "Profil" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-border/40 bg-elevated/95 backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 px-1",
                "transition-all duration-200 rounded-xl",
                "active:scale-90",
                isActive ? "text-gold" : "text-t-muted",
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-5 w-5" : "h-5 w-5",
                )} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold" />
                )}
              </div>
              <span
                className={cn(
                  "text-2xs font-medium transition-colors",
                  isActive ? "text-gold" : "text-t-muted",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

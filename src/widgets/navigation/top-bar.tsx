import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { useSession } from "@/features/auth/hooks/use-session";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useTheme } from "@/app/providers/theme-provider";
import { useLocale } from "@/shared/hooks/use-locale";

const navigation = [
  { to: "/home", labelKey: "navigation.home" },
  { to: "/courses", labelKey: "navigation.courses" },
  { to: "/mini-apps", labelKey: "navigation.miniApps" },
  { to: "/profile", labelKey: "navigation.profile" },
];

export const TopBar = () => {
  const { t } = useTranslation("common");
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="rounded-[1.5rem] border border-border/70 bg-surface/95 px-4 py-3 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link className="text-lg font-semibold tracking-tight text-text" to="/home">
            TopOne React
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-border bg-background/70 p-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm text-muted transition hover:text-primary",
                  location.pathname.startsWith(item.to) && "bg-primary text-slate-950",
                )}
                to={item.to}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}>
            {locale.toUpperCase()}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "Dark" : "Light"}
          </Button>
          {session.user ? <span className="text-sm text-muted">{session.user.firstName}</span> : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            {t("actions.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
};

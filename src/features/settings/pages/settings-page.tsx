import { useState } from "react";
import { Moon, Sun, Zap, ZapOff, Globe, ChevronRight, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/shared/lib/cn";

const THEME_KEY = "topone-theme";
const ECONOMY_KEY = "topone-economy";

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-6 w-11 rounded-full border transition-all duration-200",
      checked
        ? "border-gold/40 bg-gold/20"
        : "border-border/60 bg-elevated",
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200",
        checked
          ? "left-[calc(100%-1.375rem)] bg-gold"
          : "left-0.5 bg-t-muted",
      )}
    />
  </button>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light") ?? "dark";
  });

  const [economy, setEconomy] = useState(() => {
    return localStorage.getItem(ECONOMY_KEY) === "true";
  });

  const handleTheme = (isDark: boolean) => {
    const next = isDark ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleEconomy = (val: boolean) => {
    setEconomy(val);
    localStorage.setItem(ECONOMY_KEY, String(val));
    if (val) {
      document.documentElement.classList.add("economy-mode");
    } else {
      document.documentElement.classList.remove("economy-mode");
    }
  };

  return (
    <MobileScreen>
      <PageHeader title="Sozlamalar" />

      <div className="mt-4 space-y-4">
        {/* Appearance */}
        <GlassCard>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">Ko'rinish</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-gold" />
                ) : (
                  <Sun className="h-4 w-4 text-gold" />
                )}
                <div>
                  <p className="text-sm font-medium text-t-primary">Qora tema</p>
                  <p className="text-xs text-t-muted">Premium dark/gold interfeys</p>
                </div>
              </div>
              <Toggle checked={theme === "dark"} onChange={handleTheme} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {economy ? (
                  <ZapOff className="h-4 w-4 text-t-muted" />
                ) : (
                  <Zap className="h-4 w-4 text-gold" />
                )}
                <div>
                  <p className="text-sm font-medium text-t-primary">Tejamkor rejim</p>
                  <p className="text-xs text-t-muted">Animatsiya va blur o'chiriladi</p>
                </div>
              </div>
              <Toggle checked={economy} onChange={handleEconomy} />
            </div>
          </div>
        </GlassCard>

        {/* Language */}
        <GlassCard>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">Til</p>
          <button className="flex w-full items-center gap-3">
            <Globe className="h-4 w-4 text-gold" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-t-primary">O'zbek</p>
              <p className="text-xs text-t-muted">Interfeys tili</p>
            </div>
            <ChevronRight className="h-4 w-4 text-t-muted" />
          </button>
        </GlassCard>

        {/* Security */}
        <GlassCard padding="none">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-elevated transition-all"
            onClick={() => navigate("/profile")}
          >
            <Shield className="h-4 w-4 text-gold" />
            <span className="flex-1 text-left text-sm font-medium text-t-primary">Parol o'zgartirish</span>
            <ChevronRight className="h-4 w-4 text-t-muted" />
          </button>
        </GlassCard>

        {/* Logout */}
        <GlassCard padding="none">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-danger hover:bg-danger/5 transition-all"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="flex-1 text-left text-sm font-medium">Chiqish</span>
          </button>
        </GlassCard>

        <p className="text-center text-2xs text-t-muted">TopOne v0.1.0</p>
      </div>
    </MobileScreen>
  );
};

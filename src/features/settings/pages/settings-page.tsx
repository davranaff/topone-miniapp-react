import {
  Moon,
  Sun,
  Zap,
  ZapOff,
  Globe,
  ChevronRight,
  Shield,
  LogOut,
  Sparkles,
  Droplets,
  Bell,
  UserSquare2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/app/providers/theme-provider";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Switch } from "@/shared/ui/switch";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useLocale } from "@/shared/hooks/use-locale";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const { theme, setTheme, glassEffectEnabled, setGlassEffectEnabled, economyMode, setEconomyMode } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <MobileScreen>
      <PageHeader title="Sozlamalar" subtitle="Interfeys, account va xavfsizlik parametrlari" />

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
                  <p className="text-xs text-t-muted">Dark va light tema bir xil glass tizimda ishlaydi</p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {glassEffectEnabled ? (
                  <Sparkles className="h-4 w-4 text-gold" />
                ) : (
                  <Droplets className="h-4 w-4 text-t-muted" />
                )}
                <div>
                  <p className="text-sm font-medium text-t-primary">Liquid glass</p>
                  <p className="text-xs text-t-muted">O'chirilsa effekt soddalashadi, faqat yengil blur qoladi</p>
                </div>
              </div>
              <Switch checked={glassEffectEnabled} onCheckedChange={setGlassEffectEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {economyMode ? (
                  <ZapOff className="h-4 w-4 text-t-muted" />
                ) : (
                  <Zap className="h-4 w-4 text-gold" />
                )}
                <div>
                  <p className="text-sm font-medium text-t-primary">Tejamkor rejim</p>
                  <p className="text-xs text-t-muted">Animatsiya kamayadi, glass va shadow yengillashadi</p>
                </div>
              </div>
              <Switch checked={economyMode} onCheckedChange={setEconomyMode} />
            </div>
          </div>
        </GlassCard>

        {/* Language */}
        <GlassCard>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">Til</p>
          <button
            type="button"
            onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
            className="liquid-glass-button-chip liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-3 py-3"
          >
            <Globe className="h-4 w-4 text-gold" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-t-primary">{locale === "ru" ? "Русский" : "O'zbek"}</p>
              <p className="text-xs text-t-muted">Interfeys tili</p>
            </div>
            <ChevronRight className="h-4 w-4 text-t-muted" />
          </button>
        </GlassCard>

        {/* Account */}
        <GlassCard padding="none">
          <div className="space-y-1 p-1.5">
            <button
              className="liquid-glass-button-chip liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all"
              onClick={() => navigate("/account")}
            >
              <UserSquare2 className="h-4 w-4 text-gold" />
              <span className="flex-1 text-left text-sm font-medium text-t-primary">
                Akkaunt ma'lumotlari
              </span>
              <ChevronRight className="h-4 w-4 text-t-muted" />
            </button>

            <button
              className="liquid-glass-button-chip liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-4 w-4 text-gold" />
              <span className="flex-1 text-left text-sm font-medium text-t-primary">
                Bildirishnomalar
              </span>
              <ChevronRight className="h-4 w-4 text-t-muted" />
            </button>

            <button
              className="liquid-glass-button-chip liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all"
              onClick={() => navigate("/profile")}
            >
              <Shield className="h-4 w-4 text-gold" />
              <span className="flex-1 text-left text-sm font-medium text-t-primary">
                Profil ko'rinishi
              </span>
              <ChevronRight className="h-4 w-4 text-t-muted" />
            </button>
          </div>
        </GlassCard>

        {/* Logout */}
        <GlassCard padding="none">
          <button
            className="liquid-glass-button-danger-soft liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-xl px-4 py-3 text-danger transition-all"
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

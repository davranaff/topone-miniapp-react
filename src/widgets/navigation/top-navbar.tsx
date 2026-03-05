import { ArrowLeft } from "lucide-react";
import { matchPath, useLocation } from "react-router-dom";
import { TopActionCluster } from "@/widgets/navigation/top-action-cluster";
import { useResolvedShellNav } from "@/widgets/navigation/shell-nav";
import { useUserStats } from "@/features/home/hooks/use-user-stats";
import { useUnreadCount } from "@/features/notifications/hooks/use-notifications";

type RouteMeta = {
  pattern: string;
  title: string;
  subtitle?: string;
};

const ROUTE_META: RouteMeta[] = [
  { pattern: "/home", title: "Bosh sahifa", subtitle: "Qaytganingiz bilan!" },
  { pattern: "/courses", title: "Kurslar", subtitle: "Ta'lim katalogi" },
  { pattern: "/courses/:courseId", title: "Kurs", subtitle: "Kurs tafsilotlari" },
  { pattern: "/courses/:courseId/lessons", title: "Darslar", subtitle: "Kurs bo'limlari" },
  { pattern: "/courses/:courseId/lessons/:lessonId", title: "Dars", subtitle: "Dars tafsilotlari" },
  { pattern: "/resources", title: "Resurslar", subtitle: "Qo'shimcha materiallar" },
  { pattern: "/challenges", title: "Challenjlar", subtitle: "Daily, weekly va monthly" },
  { pattern: "/challenges/:challengeId", title: "Challenge", subtitle: "Challenge tafsilotlari" },
  { pattern: "/leaderboard", title: "Reyting", subtitle: "Natijalar jadvali" },
  { pattern: "/profile", title: "Profil", subtitle: "Shaxsiy ma'lumotlar" },
  { pattern: "/referrals", title: "Referallar", subtitle: "Do'stlarni taklif qiling" },
  { pattern: "/notifications", title: "Bildirishnomalar", subtitle: "So'nggi yangiliklar" },
  { pattern: "/settings", title: "Sozlamalar", subtitle: "Ilova parametrlari" },
  { pattern: "/subscription", title: "Obuna rejalari", subtitle: "Tariflarni tanlang" },
  { pattern: "/payment-methods", title: "To'lov usuli", subtitle: "Qulay usulni tanlang" },
  { pattern: "/payment-waiting", title: "To'lov", subtitle: "To'lov holati kuzatilmoqda" },
  { pattern: "/payment-success", title: "To'lov muvaffaqiyatli", subtitle: "Obuna faollashtirildi" },
  { pattern: "/achievements", title: "Yutuqlar", subtitle: "Mukofotlar va progress" },
  { pattern: "/levels", title: "Darajalar", subtitle: "Rivojlanish bosqichlari" },
  { pattern: "/account", title: "Akkaunt", subtitle: "Hisob sozlamalari" },
  { pattern: "/transactions", title: "Tranzaksiyalar", subtitle: "Harakatlar tarixi" },
  { pattern: "/transactions/xp", title: "XP tranzaksiyalar", subtitle: "XP tarixini ko'ring" },
  { pattern: "/transactions/coins", title: "Coin tranzaksiyalar", subtitle: "Coin tarixini ko'ring" },
  { pattern: "/feedback", title: "Fikr-mulohaza", subtitle: "Taklif va fikrlarni yuboring" },
  { pattern: "/stream-chat-list", title: "Chat", subtitle: "Suhbatlar ro'yxati" },
  { pattern: "/stream-chat-channel", title: "Chat", subtitle: "Kanal yozishmalari" },
  { pattern: "/stream-chat-channel-info", title: "Chat", subtitle: "Kanal ma'lumotlari" },
  { pattern: "/lessons", title: "Darslar", subtitle: "Mavjud darslar" },
  { pattern: "/lesson-details", title: "Dars", subtitle: "Dars tafsilotlari" },
  { pattern: "/mini-apps", title: "Mini-apps", subtitle: "TopOne mini ilovalari" },
  { pattern: "/mini-apps/:slug", title: "Mini-app", subtitle: "Ilova tafsilotlari" },
];

const resolveRouteMeta = (pathname: string) => {
  for (const item of ROUTE_META) {
    if (matchPath({ path: item.pattern, end: true }, pathname)) {
      return item;
    }
  }

  return { title: "TopOne", subtitle: "Platforma" };
};

export const TopNavbar = () => {
  const location = useLocation();
  const shellNav = useResolvedShellNav();
  const stats = useUserStats();
  const unread = useUnreadCount();
  const { title, subtitle } = resolveRouteMeta(location.pathname);
  const showBackButton = shellNav.showBackButton;

  return (
    <div className="sticky top-0 z-40 w-full">
      <header className="top-navbar-shell flex w-full items-center gap-3 px-4 py-3 lg:px-6 xl:px-7">
        {showBackButton ? (
          <button
            type="button"
            onClick={shellNav.onBack}
            aria-label={shellNav.backButtonMode === "home" ? "Go home" : "Go back"}
            className="liquid-glass-chip liquid-glass-surface-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-t-secondary transition hover:border-gold/40 hover:text-t-primary active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-t-primary lg:text-[1.8rem]">{title}</h1>
          {subtitle ? <p className="mt-0.5 truncate text-sm text-t-muted/90">{subtitle}</p> : null}
        </div>

        <TopActionCluster
          coins={stats.data?.coins ?? 0}
          stars={stats.data?.xp ?? 0}
          unreadNotifications={unread.data ?? 0}
          className="shrink-0"
        />
      </header>
    </div>
  );
};

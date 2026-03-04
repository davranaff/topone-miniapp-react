import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { AuthShell } from "@/app/layouts/auth-shell";
import { TelegramShell } from "@/app/layouts/telegram-shell";
import { AppErrorPage } from "@/app/router/error-page";
import { ProtectedRoute } from "@/app/router/protected-route";
import { PublicRoute } from "@/app/router/public-route";
import { Spinner } from "@/shared/ui/spinner";
import { TopOneLogo } from "@/shared/ui/topone-logo";
import type { AppRouteDefinition } from "@/app/router/route-types";
import { flutterScreenRoutes } from "@/shared/config/flutter-screens";

const SplashPage = lazy(() => import("@/features/splash/pages/splash-page").then((m) => ({ default: m.SplashPage })));
const LoginPage = lazy(() => import("@/features/auth/pages/login-page").then((m) => ({ default: m.LoginPage })));
const LoginFormPage = lazy(() => import("@/features/auth/pages/login-form-page").then((m) => ({ default: m.LoginFormPage })));
const RegisterPage = lazy(() => import("@/features/auth/pages/register-page").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/forgot-password-page").then((m) => ({ default: m.ForgotPasswordPage })));
const TelegramInitPage = lazy(() => import("@/features/auth/pages/telegram-init-page").then((m) => ({ default: m.TelegramInitPage })));
const HomePage = lazy(() => import("@/features/home/pages/home-page").then((m) => ({ default: m.HomePage })));
const CoursesPage = lazy(() => import("@/features/courses/pages/courses-page").then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import("@/features/courses/pages/course-detail-page").then((m) => ({ default: m.CourseDetailPage })));
const ProfilePage = lazy(() => import("@/features/profile/pages/profile-page").then((m) => ({ default: m.ProfilePage })));
const MiniAppsPage = lazy(() => import("@/features/mini-apps/pages/mini-apps-page").then((m) => ({ default: m.MiniAppsPage })));
const MiniAppHostPage = lazy(() => import("@/features/mini-apps/pages/mini-app-host-page").then((m) => ({ default: m.MiniAppHostPage })));
const ChallengesPage = lazy(() => import("@/features/challenges/pages/challenges-page").then((m) => ({ default: m.ChallengesPage })));
const ChallengeDetailPage = lazy(() => import("@/features/challenges/pages/challenge-detail-page").then((m) => ({ default: m.ChallengeDetailPage })));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/notifications-page").then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import("@/features/settings/pages/settings-page").then((m) => ({ default: m.SettingsPage })));
const ChatPage = lazy(() => import("@/features/chat/pages/chat-page").then((m) => ({ default: m.ChatPage })));
const LessonsListPage = lazy(() => import("@/features/lessons/pages/lessons-list-page").then((m) => ({ default: m.LessonsListPage })));
const LessonDetailPage = lazy(() => import("@/features/lessons/pages/lesson-detail-page").then((m) => ({ default: m.LessonDetailPage })));
const AchievementsPage = lazy(() => import("@/features/achievements/pages/achievements-page").then((m) => ({ default: m.AchievementsPage })));
const LeaderboardPage = lazy(() => import("@/features/leaderboard/pages/leaderboard-page").then((m) => ({ default: m.LeaderboardPage })));
const SubscriptionPage = lazy(() => import("@/features/payment/pages/subscription-page").then((m) => ({ default: m.SubscriptionPage })));
const PaymentMethodsPage = lazy(() => import("@/features/payment/pages/payment-methods-page").then((m) => ({ default: m.PaymentMethodsPage })));
const PaymentWaitingPage = lazy(() => import("@/features/payment/pages/payment-waiting-page").then((m) => ({ default: m.PaymentWaitingPage })));
const PaymentResultPage = lazy(() => import("@/features/payment/pages/payment-result-page").then((m) => ({ default: m.PaymentResultPage })));
const PaymentSuccessPage = lazy(() => import("@/features/payment/pages/payment-success-page").then((m) => ({ default: m.PaymentSuccessPage })));
const ReferralsPage = lazy(() => import("@/features/referrals/pages/referrals-page").then((m) => ({ default: m.ReferralsPage })));
const LevelsPage = lazy(() => import("@/features/levels/pages/levels-page").then((m) => ({ default: m.LevelsPage })));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/reset-password-page").then((m) => ({ default: m.ResetPasswordPage })));
const SetPasswordPage = lazy(() => import("@/features/auth/pages/set-password-page").then((m) => ({ default: m.SetPasswordPage })));
const TelegramLoginPage = lazy(() => import("@/features/auth/pages/telegram-login-page").then((m) => ({ default: m.TelegramLoginPage })));
const TelegramCodeVerificationPage = lazy(() => import("@/features/auth/pages/telegram-code-verification-page").then((m) => ({ default: m.TelegramCodeVerificationPage })));
const AccountPage = lazy(() => import("@/features/account/pages/account-page").then((m) => ({ default: m.AccountPage })));
const ResourcesPage = lazy(() => import("@/features/resources/pages/resources-page").then((m) => ({ default: m.ResourcesPage })));
const TransactionsPage = lazy(() => import("@/features/transactions/pages/transactions-page").then((m) => ({ default: m.TransactionsPage })));
const FeedbackPage = lazy(() => import("@/features/feedback/pages/feedback-page").then((m) => ({ default: m.FeedbackPage })));
const WebViewPage = lazy(() => import("@/features/webview/pages/webview-page").then((m) => ({ default: m.WebViewPage })));
const ChatChannelPage = lazy(() => import("@/features/chat/pages/chat-channel-page").then((m) => ({ default: m.ChatChannelPage })));

const PageFallback = () => (
  <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-6">
    <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-gold/12 blur-3xl" />
    <div className="relative flex flex-col items-center gap-4 text-center">
      <TopOneLogo size="md" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-t-primary">TopOne</p>
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">loading</p>
      </div>
      <Spinner size="lg" />
    </div>
  </div>
);

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

const routesMeta: AppRouteDefinition[] = [
  { path: "/", element: <SplashPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/splash", element: <SplashPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/login", element: <LoginPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/register", element: <RegisterPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/forgot-password", element: <ForgotPasswordPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/reset-password", element: <ResetPasswordPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/set-password", element: <SetPasswordPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/login-form", element: <LoginFormPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/telegram-login", element: <TelegramLoginPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/telegram-code-verification", element: <TelegramCodeVerificationPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/telegram/init", element: <TelegramInitPage />, meta: { requiresAuth: false, layout: "telegram" } },
  { path: "/telegram-webapp-init", element: <TelegramInitPage />, meta: { requiresAuth: false, layout: "telegram" } },
  { path: "/home", element: <HomePage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses", element: <CoursesPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses/:courseId", element: <CourseDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/profile", element: <ProfilePage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/mini-apps", element: <MiniAppsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/mini-apps/:slug", element: <MiniAppHostPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/challenges", element: <ChallengesPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/challenges/:challengeId", element: <ChallengeDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/notifications", element: <NotificationsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/settings", element: <SettingsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/stream-chat-list", element: <ChatPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses/:courseId/lessons", element: <LessonsListPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses/:courseId/lessons/:lessonId", element: <LessonDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/achievements", element: <AchievementsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/leaderboard", element: <LeaderboardPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/subscription", element: <SubscriptionPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/referrals", element: <ReferralsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/levels", element: <LevelsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/account", element: <AccountPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/resources", element: <ResourcesPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/transactions", element: <TransactionsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/transactions/xp", element: <TransactionsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/transactions/coins", element: <TransactionsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/premium-subscription", element: <SubscriptionPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/subscription-history", element: <SubscriptionPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/payment-methods", element: <PaymentMethodsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/payment-waiting", element: <PaymentWaitingPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/payment-result", element: <PaymentResultPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/payment-success", element: <PaymentSuccessPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/feedback", element: <FeedbackPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/webview", element: <WebViewPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/stream-chat-channel", element: <ChatChannelPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/stream-chat-channel-info", element: <ChatChannelPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/lessons", element: <LessonsListPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/lesson-details", element: <LessonDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/challenge-detail", element: <ChallengeDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/mini-app-host", element: <MiniAppHostPage />, meta: { requiresAuth: true, layout: "app" } },
  ...flutterScreenRoutes,
];

const wrapRoute = (route: AppRouteDefinition) => {
  const wrapped = withSuspense(route.element);
  const page = route.meta.requiresAuth ? <ProtectedRoute>{wrapped}</ProtectedRoute> : wrapped;

  if (route.meta.guestOnly) {
    return <PublicRoute>{page}</PublicRoute>;
  }

  return page;
};

export const routeMap: RouteObject[] = [
  {
    element: <AuthShell />,
    errorElement: <AppErrorPage />,
    children: routesMeta
      .filter((route) => route.meta.layout === "auth")
      .map((route) => ({ path: route.path, element: wrapRoute(route) })),
  },
  {
    element: <TelegramShell />,
    errorElement: <AppErrorPage />,
    children: routesMeta
      .filter((route) => route.meta.layout === "telegram")
      .map((route) => ({ path: route.path, element: wrapRoute(route) })),
  },
  {
    element: <AppShell />,
    errorElement: <AppErrorPage />,
    children: routesMeta
      .filter((route) => route.meta.layout === "app")
      .map((route) => ({ path: route.path, element: wrapRoute(route) })),
  },
  {
    path: "*",
    element: <Navigate replace to="/" />,
  },
];

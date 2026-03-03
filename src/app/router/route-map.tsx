import { Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { AuthShell } from "@/app/layouts/auth-shell";
import { TelegramShell } from "@/app/layouts/telegram-shell";
import { AppErrorPage } from "@/app/router/error-page";
import { ProtectedRoute } from "@/app/router/protected-route";
import { PublicRoute } from "@/app/router/public-route";
import { SplashPage } from "@/features/splash/pages/splash-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";
import { TelegramInitPage } from "@/features/auth/pages/telegram-init-page";
import { HomePage } from "@/features/home/pages/home-page";
import { CoursesPage } from "@/features/courses/pages/courses-page";
import { CourseDetailPage } from "@/features/courses/pages/course-detail-page";
import { ProfilePage } from "@/features/profile/pages/profile-page";
import { MiniAppsPage } from "@/features/mini-apps/pages/mini-apps-page";
import { MiniAppHostPage } from "@/features/mini-apps/pages/mini-app-host-page";
import type { AppRouteDefinition } from "@/app/router/route-types";
import { flutterScreenRoutes } from "@/shared/config/flutter-screens";

const routesMeta: AppRouteDefinition[] = [
  { path: "/", element: <SplashPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/splash", element: <SplashPage />, meta: { requiresAuth: false, layout: "auth" } },
  { path: "/login", element: <LoginPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/register", element: <RegisterPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/forgot-password", element: <ForgotPasswordPage />, meta: { requiresAuth: false, guestOnly: true, layout: "auth" } },
  { path: "/telegram/init", element: <TelegramInitPage />, meta: { requiresAuth: false, layout: "telegram" } },
  { path: "/telegram-webapp-init", element: <TelegramInitPage />, meta: { requiresAuth: false, layout: "telegram" } },
  { path: "/home", element: <HomePage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses", element: <CoursesPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/courses/:courseId", element: <CourseDetailPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/profile", element: <ProfilePage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/mini-apps", element: <MiniAppsPage />, meta: { requiresAuth: true, layout: "app" } },
  { path: "/mini-apps/:slug", element: <MiniAppHostPage />, meta: { requiresAuth: true, layout: "app" } },
  ...flutterScreenRoutes,
];

const wrapRoute = (route: AppRouteDefinition) => {
  const page = route.meta.requiresAuth ? <ProtectedRoute>{route.element}</ProtectedRoute> : route.element;

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

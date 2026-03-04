/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  BarChart3,
  BookOpenText,
  CircleHelp,
  Home,
  Trophy,
  UsersRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

export type ShellNavAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "gold" | "danger" | "success";
};

type ShellNavOverride = {
  hideDock?: boolean;
  hideTabs?: boolean;
  showBackButton?: boolean;
  backButtonMode?: "back" | "home";
  onBack?: () => void;
  showChatButton?: boolean;
  onChat?: () => void;
  action?: ShellNavAction | null;
};

export type ShellNavTab = {
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

type ResolvedShellNav = {
  hideDock: boolean;
  hideTabs: boolean;
  showBackButton: boolean;
  backButtonMode: "back" | "home";
  onBack?: () => void;
  showChatButton: boolean;
  onChat?: () => void;
  action: ShellNavAction | null;
  tabs: ShellNavTab[];
  selectedIndex: number;
};

type ShellNavContextValue = {
  override: ShellNavOverride;
  setOverride: (value: ShellNavOverride) => void;
  resetOverride: () => void;
};

const defaultOverride: ShellNavOverride = {};

const ShellNavContext = createContext<ShellNavContextValue | null>(null);

const isRoute = (pathname: string, pattern: string) => {
  return matchPath({ path: pattern, end: true }, pathname) != null;
};

const startsWithRoute = (pathname: string, prefix: string) => {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

const defaultTabs: ShellNavTab[] = [
  {
    to: "/home",
    label: "Asosiy",
    icon: Home,
    isActive: (pathname) => pathname === "/home",
  },
  {
    to: "/courses",
    label: "Kurslar",
    icon: BookOpenText,
    isActive: (pathname) =>
      pathname === "/courses" ||
      pathname === "/resources" ||
      isRoute(pathname, "/courses/:courseId/lessons"),
  },
  {
    to: "/challenges",
    label: "Challenj",
    icon: Trophy,
    isActive: (pathname) =>
      pathname === "/challenges" ||
      pathname === "/leaderboard" ||
      isRoute(pathname, "/challenges/:challengeId"),
  },
  {
    to: "/profile",
    label: "Profil",
    icon: UserRound,
    isActive: (pathname) => pathname === "/profile" || pathname === "/referrals",
  },
];

const coursesTabs: ShellNavTab[] = [
  {
    to: "/courses",
    label: "Kurslar",
    icon: BookOpenText,
    isActive: (pathname) => pathname === "/courses" || startsWithRoute(pathname, "/courses/"),
  },
  {
    to: "/resources",
    label: "Resurslar",
    icon: CircleHelp,
    isActive: (pathname) => pathname === "/resources",
  },
];

const challengesTabs: ShellNavTab[] = [
  {
    to: "/challenges",
    label: "Challenj",
    icon: Trophy,
    isActive: (pathname) => pathname === "/challenges" || startsWithRoute(pathname, "/challenges/"),
  },
  {
    to: "/leaderboard",
    label: "Reyting",
    icon: BarChart3,
    isActive: (pathname) => pathname === "/leaderboard",
  },
];

const profileTabs: ShellNavTab[] = [
  {
    to: "/profile",
    label: "Profil",
    icon: UserRound,
    isActive: (pathname) => pathname === "/profile",
  },
  {
    to: "/referrals",
    label: "Referal",
    icon: UsersRound,
    isActive: (pathname) => pathname === "/referrals",
  },
];

const getBaseConfig = (pathname: string): Omit<ResolvedShellNav, "onBack" | "onChat" | "action"> => {
  if (pathname === "/home") {
    return {
      hideDock: false,
      hideTabs: false,
      showBackButton: false,
      backButtonMode: "back",
      showChatButton: true,
      tabs: defaultTabs,
      selectedIndex: 0,
    };
  }

  if (pathname === "/courses" || pathname === "/resources") {
    return {
      hideDock: false,
      hideTabs: false,
      showBackButton: true,
      backButtonMode: "home",
      showChatButton: false,
      tabs: coursesTabs,
      selectedIndex: pathname === "/resources" ? 1 : 0,
    };
  }

  if (
    pathname === "/challenges" ||
    pathname === "/leaderboard"
  ) {
    return {
      hideDock: false,
      hideTabs: false,
      showBackButton: true,
      backButtonMode: "home",
      showChatButton: false,
      tabs: challengesTabs,
      selectedIndex: pathname === "/leaderboard" ? 1 : 0,
    };
  }

  if (pathname === "/profile" || pathname === "/referrals") {
    return {
      hideDock: false,
      hideTabs: false,
      showBackButton: true,
      backButtonMode: "home",
      showChatButton: false,
      tabs: profileTabs,
      selectedIndex: pathname === "/referrals" ? 1 : 0,
    };
  }

  if (
    pathname === "/lessons" ||
    isRoute(pathname, "/courses/:courseId/lessons") ||
    isRoute(pathname, "/courses/:courseId/lessons/:lessonId") ||
    pathname === "/lesson-details"
  ) {
    return {
      hideDock: false,
      hideTabs: true,
      showBackButton: true,
      backButtonMode: "back",
      showChatButton: true,
      tabs: [],
      selectedIndex: -1,
    };
  }

  if (
    pathname === "/stream-chat-list" ||
    pathname === "/stream-chat-channel" ||
    pathname === "/stream-chat-channel-info" ||
    pathname === "/settings" ||
    pathname === "/notifications" ||
    pathname === "/subscription" ||
    pathname === "/premium-subscription" ||
    pathname === "/subscription-history" ||
    pathname === "/payment-methods" ||
    pathname === "/payment-waiting" ||
    pathname === "/payment-result" ||
    pathname === "/payment-success" ||
    pathname === "/account" ||
    pathname === "/transactions" ||
    pathname === "/transactions/xp" ||
    pathname === "/transactions/coins" ||
    pathname === "/achievements" ||
    isRoute(pathname, "/courses/:courseId") ||
    isRoute(pathname, "/challenges/:challengeId")
  ) {
    return {
      hideDock: false,
      hideTabs: true,
      showBackButton: true,
      backButtonMode: "back",
      showChatButton: false,
      tabs: [],
      selectedIndex: -1,
    };
  }

  return {
    hideDock: false,
    hideTabs: false,
    showBackButton: false,
    backButtonMode: "back",
    showChatButton: false,
    tabs: defaultTabs,
    selectedIndex: defaultTabs.findIndex((tab) => tab.isActive(pathname)),
  };
};

export const ShellNavProvider = ({ children }: PropsWithChildren) => {
  const [override, setOverrideState] = useState<ShellNavOverride>(defaultOverride);
  const setOverride = useCallback((value: ShellNavOverride) => {
    setOverrideState(value);
  }, []);
  const resetOverride = useCallback(() => {
    setOverrideState(defaultOverride);
  }, []);

  const value = useMemo(
    () => ({
      override,
      setOverride,
      resetOverride,
    }),
    [override, resetOverride, setOverride],
  );

  return (
    <ShellNavContext.Provider value={value}>{children}</ShellNavContext.Provider>
  );
};

export const useShellNav = () => {
  const context = useContext(ShellNavContext);

  if (!context) {
    throw new Error("useShellNav must be used within ShellNavProvider");
  }

  return context;
};

export const useOptionalShellNav = () => {
  return useContext(ShellNavContext);
};

const resolveShellNav = (
  pathname: string,
  navigate: ReturnType<typeof useNavigate>,
  override: ShellNavOverride,
): ResolvedShellNav => {
  const base = getBaseConfig(pathname);
  const isLessonChatRoute =
    pathname === "/lessons" ||
    isRoute(pathname, "/courses/:courseId/lessons") ||
    isRoute(pathname, "/courses/:courseId/lessons/:lessonId") ||
    pathname === "/lesson-details";

  return {
    ...base,
    hideDock: override.hideDock ?? base.hideDock,
    hideTabs: override.hideTabs ?? base.hideTabs,
    showBackButton: override.showBackButton ?? base.showBackButton,
    backButtonMode: override.backButtonMode ?? base.backButtonMode,
    onBack:
      override.onBack ??
      (base.showBackButton
        ? () => {
            if (base.backButtonMode === "home") {
              navigate("/home");
              return;
            }

            navigate(-1);
          }
        : undefined),
    showChatButton: override.showChatButton ?? base.showChatButton,
    onChat:
      override.onChat ??
      (base.showChatButton
        ? () => navigate(isLessonChatRoute ? "/stream-chat-channel" : "/stream-chat-list")
        : undefined),
    action: override.action ?? null,
  };
};

export const useResolvedShellNav = (): ResolvedShellNav => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useShellNav();

  return resolveShellNav(location.pathname, navigate, context.override);
};

export const useOptionalResolvedShellNav = () => {
  const context = useOptionalShellNav();
  const location = useLocation();
  const navigate = useNavigate();

  if (!context) {
    return null;
  }

  return resolveShellNav(location.pathname, navigate, context.override);
};

export const useShellNavRouteReset = () => {
  const { resetOverride } = useShellNav();
  const location = useLocation();

  useEffect(() => {
    resetOverride();
  }, [location.key, resetOverride]);
};

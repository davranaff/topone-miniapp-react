import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactNode,
} from "react";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/cn";
import { useResolvedShellNav, type ShellNavAction, type ShellNavTab } from "@/widgets/navigation/shell-nav";

const DOCK_BUTTON_SIZE_CLASS = "h-[4.4rem] w-[4.4rem] lg:h-[3.95rem] lg:w-[3.95rem]";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const DOCK_EFFECT_DISTANCE = 200;
const DOCK_EFFECT_SCALE = 0.22;
const DockLiquidGlassLayer = lazy(async () => {
  const module = await import("@/shared/ui/dock-liquid-glass-layer");
  return { default: module.DockLiquidGlassLayer };
});

const DockShellDecoration = () => null;

const DockShaderLayer = ({ enabled, className }: { enabled: boolean; className?: string }) => {
  if (!enabled) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DockLiquidGlassLayer className={className} />
    </Suspense>
  );
};

const CircleDockButton = ({
  icon,
  label,
  onClick,
  useShader = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  useShader?: boolean;
}) => {
  if (!onClick) return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "liquid-glass-nav-shell liquid-glass-surface-interactive pointer-events-auto relative flex items-center justify-center overflow-hidden rounded-full",
        DOCK_BUTTON_SIZE_CLASS,
        "transition-transform duration-300 active:scale-95",
      )}
    >
      <DockShaderLayer enabled={useShader} className="z-0 opacity-60" />
      <span className="relative z-10 inline-flex items-center justify-center">{icon}</span>
    </button>
  );
};

const actionToneClass = (tone?: ShellNavAction["tone"]) => {
  if (tone === "danger") {
    return "liquid-glass-state-danger text-white";
  }

  if (tone === "success") {
    return "liquid-glass-state-success text-white";
  }

  return "liquid-glass-state-gold text-gold";
};

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = useResolvedShellNav();
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const [isDesktop, setIsDesktop] = useState(false);
  const [dockPointerX, setDockPointerX] = useState<number | null>(null);
  const [dockContainerWidth, setDockContainerWidth] = useState(0);
  const showAction = Boolean(config.action);
  const showTabs = !showAction && !config.hideTabs && config.tabs.length > 0;
  const hasCenterPanel = showTabs || showAction;
  const hasSideButtons = config.showBackButton || config.showChatButton;
  const shouldRender = showTabs || config.showBackButton || config.showChatButton || config.action;
  const desktopTabsWidth = showTabs
    ? `${Math.max(config.tabs.length, 1) * 4.4 + Math.max(config.tabs.length - 1, 0) * 0.25 + 1.25}rem`
    : undefined;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const apply = () => setIsDesktop(media.matches);
    apply();
    media.addEventListener("change", apply);

    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  useLayoutEffect(() => {
    if (!showTabs || !tabsContainerRef.current) {
      const frameId = requestAnimationFrame(() => {
        setIndicator((current) => ({ ...current, visible: false }));
      });
      return () => cancelAnimationFrame(frameId);
    }

    const updateIndicator = () => {
      const activeIndex = config.tabs.findIndex((tab, index) => {
        return index === config.selectedIndex || tab.isActive(location.pathname);
      });
      const activeNode = tabRefs.current[activeIndex];
      const containerNode = tabsContainerRef.current;

      if (!activeNode || !containerNode) {
        setIndicator((current) => ({ ...current, visible: false }));
        return;
      }

      const buttonRect = activeNode.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();

      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        visible: true,
      });
      setDockContainerWidth(containerRect.width);
    };

    const frameId = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(frameId);
  }, [config.selectedIndex, config.tabs, location.pathname, showTabs]);

  const getDockScale = (index: number) => {
    if (!isDesktop || dockPointerX == null || dockContainerWidth <= 0 || config.tabs.length <= 0) {
      return 1;
    }

    const tabCenter = ((index + 0.5) / config.tabs.length) * dockContainerWidth;
    const distance = Math.abs(dockPointerX - tabCenter);
    if (distance >= DOCK_EFFECT_DISTANCE) {
      return 1;
    }

    const influence = 1 - distance / DOCK_EFFECT_DISTANCE;
    return 1 + influence * DOCK_EFFECT_SCALE;
  };

  if (config.hideDock || !shouldRender) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-lg px-3 pb-[calc(0.95rem+env(safe-area-inset-bottom,0px))] lg:max-w-[64rem] lg:px-6 lg:pb-[calc(1rem+env(safe-area-inset-bottom,0px))] xl:max-w-[78rem]">
        <div className="relative flex min-h-[4.2rem] items-end justify-center">
          <div
            className={cn(
              "flex w-full items-end gap-2 lg:w-auto lg:gap-2.5",
              hasCenterPanel ? "justify-center" : "justify-between",
            )}
          >
            {config.showBackButton && (
              <div className="shrink-0 animate-scale-in">
                <CircleDockButton
                  label={config.backButtonMode === "home" ? "Go home" : "Go back"}
                  onClick={config.onBack}
                  useShader={isDesktop}
                  icon={
                    config.backButtonMode === "home" ? (
                      <Home className="h-5 w-5 text-gold" />
                    ) : (
                      <ArrowLeft className="h-5 w-5 text-t-primary" />
                    )
                  }
                />
              </div>
            )}

            {showTabs && (
              <div
                ref={tabsContainerRef}
                style={isDesktop ? { width: desktopTabsWidth } : undefined}
                onMouseMove={(event) => {
                  if (!isDesktop || !tabsContainerRef.current) {
                    return;
                  }

                  const rect = tabsContainerRef.current.getBoundingClientRect();
                  setDockContainerWidth(rect.width);
                  setDockPointerX(event.clientX - rect.left);
                }}
                onMouseEnter={(event) => {
                  if (!isDesktop || !tabsContainerRef.current) {
                    return;
                  }

                  const rect = tabsContainerRef.current.getBoundingClientRect();
                  setDockContainerWidth(rect.width);
                  setDockPointerX(event.clientX - rect.left);
                }}
                onMouseLeave={() => {
                  setDockPointerX(null);
                }}
                className={cn(
                  "liquid-glass-nav-shell animate-dock-pulse pointer-events-auto relative flex min-h-[4.4rem] min-w-0 items-center gap-1 overflow-hidden rounded-[70px] p-2",
                  hasSideButtons ? "flex-1" : "w-full",
                  "lg:min-h-[3.95rem] lg:flex-none lg:w-auto lg:rounded-[999px] lg:px-2.5 lg:py-1.5",
                )}
              >
                <DockShellDecoration />
                <DockShaderLayer enabled={isDesktop} className="z-0 opacity-60" />
                <div
                  className={cn(
                    "liquid-glass-nav-indicator pointer-events-none absolute top-2 z-[2] h-[calc(100%-1rem)] rounded-[58px] lg:top-1.5 lg:h-[calc(100%-0.75rem)]",
                    "transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    indicator.visible ? "opacity-100" : "opacity-0",
                  )}
                  style={{ left: indicator.left, width: indicator.width }}
                />

                {config.tabs.map((tab, index) => (
                  <ForwardedNavTabButton
                    key={tab.to}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    tab={tab}
                    dockScale={getDockScale(index)}
                    isDesktop={isDesktop}
                    active={index === config.selectedIndex || tab.isActive(location.pathname)}
                    onSelect={() => navigate(tab.to)}
                  />
                ))}
              </div>
            )}

            {config.action && (
              <button
                type="button"
                onClick={config.action.onClick}
                disabled={config.action.disabled || config.action.loading}
                key={`${config.action.label}-${config.action.tone ?? "gold"}`}
                className={cn(
                  "liquid-glass-nav-shell liquid-glass-surface-interactive pointer-events-auto relative flex h-[4.4rem] min-w-0 items-center justify-center gap-2 overflow-hidden rounded-[70px] px-4 text-sm font-semibold",
                  "[&::after]:hidden backdrop-blur-[22px] [-webkit-backdrop-filter:blur(22px)_saturate(1.14)]",
                  "animate-scale-in",
                  hasSideButtons ? "flex-1" : "w-full",
                  "lg:h-[3.95rem] lg:flex-none lg:w-auto lg:max-w-[34rem]",
                  actionToneClass(config.action.tone),
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  config.action.tone === "gold" || !config.action.tone
                    ? "liquid-glass-accent text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]"
                    : "liquid-glass-chip text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.65)]",
                )}
              >
                <DockShellDecoration />
                <DockShaderLayer enabled={isDesktop} className="z-0 opacity-60" />
                {config.action.loading ? (
                  <Spinner size="sm" className="relative z-10 border-white/20 border-t-white" />
                ) : (
                  <span className="relative z-10">{config.action.icon}</span>
                )}
                <span className="relative z-10">{config.action.label}</span>
              </button>
            )}

            {config.showChatButton && (
              <div className="shrink-0 animate-scale-in">
                <CircleDockButton
                  label="Open chat"
                  onClick={config.onChat}
                  useShader={isDesktop}
                  icon={<MessageCircle className="h-5 w-5 text-t-muted" />}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type NavTabButtonProps = {
  tab: ShellNavTab;
  active: boolean;
  dockScale: number;
  isDesktop: boolean;
  onSelect: () => void;
};

const NavTabButton = ({
  tab,
  active,
  dockScale,
  isDesktop,
  onSelect,
}: NavTabButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const Icon = tab.icon;
  const extraLift = isDesktop ? Math.max(0, (dockScale - 1) * 12) : 0;
  const style: CSSProperties = {
    transform: `translateY(${(active ? -1 : 0) - extraLift}px) scale(${dockScale})`,
    transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease",
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      style={style}
      className={cn(
        "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[58px] px-3 py-2.5",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        active ? "text-gold" : "text-t-muted hover:text-t-primary",
        "lg:h-[3.15rem] lg:w-[4.4rem] lg:flex-none lg:justify-center lg:gap-0.5 lg:px-0 lg:py-0",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform duration-300 lg:h-[1.3rem] lg:w-[1.3rem]", active && "scale-110 drop-shadow-[0_0_18px_rgba(212,160,23,0.32)]")} />
      <span className={cn("truncate text-[0.68rem] font-medium transition-colors duration-300 lg:hidden", active && "text-gold")}>
        {tab.label}
      </span>
    </button>
  );
};

const ForwardedNavTabButton = forwardRef<HTMLButtonElement, NavTabButtonProps>(NavTabButton);
ForwardedNavTabButton.displayName = "NavTabButton";

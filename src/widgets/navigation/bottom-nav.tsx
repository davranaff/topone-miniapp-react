import { forwardRef, useLayoutEffect, useRef, useState, type ForwardedRef, type ReactNode } from "react";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/cn";
import { useResolvedShellNav, type ShellNavAction, type ShellNavTab } from "@/widgets/navigation/shell-nav";

const DOCK_BUTTON_SIZE_CLASS = "h-[4.75rem] w-[4.75rem]";

const DockShellDecoration = () => null;

const CircleDockButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  if (!onClick) return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "liquid-glass-button-icon liquid-glass-surface-interactive pointer-events-auto flex items-center justify-center rounded-full",
        DOCK_BUTTON_SIZE_CLASS,
        "transition-transform duration-300 active:scale-95",
      )}
    >
      {icon}
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
  const showTabs = !config.hideTabs && config.tabs.length > 0;
  const shouldRender = showTabs || config.showBackButton || config.showChatButton || config.action;

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
    };

    const frameId = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(frameId);
  }, [config.selectedIndex, config.tabs, location.pathname, showTabs]);

  if (config.hideDock || !shouldRender) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-lg px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="relative flex min-h-[4.5rem] items-end justify-center">
          {config.showBackButton && (
            <div className="absolute left-0 bottom-0 animate-scale-in">
              <CircleDockButton
                label={config.backButtonMode === "home" ? "Go home" : "Go back"}
                onClick={config.onBack}
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
              className={cn(
                "liquid-glass-nav-shell animate-dock-pulse pointer-events-auto relative flex min-h-[4.75rem] w-full items-center gap-1 overflow-hidden rounded-[70px] p-2.5",
                config.showBackButton && "ml-[5.25rem]",
                config.showChatButton && "mr-[5.25rem]",
              )}
            >
              <DockShellDecoration />
              <div
                className={cn(
                  "liquid-glass-nav-indicator pointer-events-none absolute top-2.5 h-[calc(100%-1.25rem)] rounded-[58px]",
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
                  active={index === config.selectedIndex || tab.isActive(location.pathname)}
                  onSelect={() => navigate(tab.to)}
                />
              ))}
            </div>
          )}

          {config.action && (
            <div
              key={`${config.action.label}-${config.action.tone ?? "gold"}`}
              className={cn(
                "liquid-glass-nav-shell pointer-events-auto flex h-[4.75rem] items-center overflow-hidden rounded-[70px] p-2.5",
                "animate-scale-in",
                config.showBackButton ? "ml-[5.25rem]" : "ml-0",
                config.showChatButton ? "mr-[5.25rem]" : "mr-0",
                showTabs ? "absolute inset-x-[5.75rem] bottom-0" : "w-full",
                actionToneClass(config.action.tone),
              )}
            >
              <DockShellDecoration />
              <button
                type="button"
                onClick={config.action.onClick}
                disabled={config.action.disabled || config.action.loading}
                className={cn(
                  "liquid-glass-surface-interactive flex h-full w-full items-center justify-center gap-2 rounded-[1.4rem] px-4 text-sm font-semibold",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  config.action.tone === "gold" || !config.action.tone
                    ? "liquid-glass-accent text-t-inverse"
                    : "liquid-glass-chip text-t-primary",
                )}
              >
                {config.action.loading ? (
                  <Spinner size="sm" className="border-white/20 border-t-white" />
                ) : (
                  config.action.icon
                )}
                <span>{config.action.label}</span>
              </button>
            </div>
          )}

          {config.showChatButton && (
            <div className="absolute right-0 bottom-0 animate-scale-in">
              <CircleDockButton
                label="Open chat"
                onClick={config.onChat}
                icon={<MessageCircle className="h-5 w-5 text-gold" />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type NavTabButtonProps = {
  tab: ShellNavTab;
  active: boolean;
  onSelect: () => void;
};

const NavTabButton = ({
  tab,
  active,
  onSelect,
}: NavTabButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const Icon = tab.icon;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={cn(
        "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[58px] px-3 py-2.5",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95",
        active ? "text-gold" : "text-t-muted hover:text-t-primary",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_18px_rgba(212,160,23,0.32)]")} />
      <span className={cn("truncate text-[0.68rem] font-medium transition-colors duration-300", active && "text-gold")}>
        {tab.label}
      </span>
    </button>
  );
};

const ForwardedNavTabButton = forwardRef<HTMLButtonElement, NavTabButtonProps>(NavTabButton);
ForwardedNavTabButton.displayName = "NavTabButton";

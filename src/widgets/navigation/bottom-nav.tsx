import { forwardRef, useLayoutEffect, useRef, useState, type ForwardedRef, type ReactNode } from "react";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/cn";
import { useResolvedShellNav, type ShellNavAction, type ShellNavTab } from "@/widgets/navigation/shell-nav";

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
        "pointer-events-auto flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full",
        "border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,10,10,0.58))]",
        "shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-[18px]",
        "transition-transform duration-300 active:scale-95",
      )}
    >
      {icon}
    </button>
  );
};

const actionToneClass = (tone?: ShellNavAction["tone"]) => {
  if (tone === "danger") {
    return "border-danger/30 bg-[linear-gradient(180deg,rgba(239,68,68,0.18),rgba(24,24,24,0.92))] text-white";
  }

  if (tone === "success") {
    return "border-success/30 bg-[linear-gradient(180deg,rgba(34,197,94,0.18),rgba(24,24,24,0.92))] text-white";
  }

  return "border-gold/20 bg-[linear-gradient(180deg,rgba(245,200,66,0.2),rgba(24,24,24,0.92))] text-gold";
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
                "glass-lg animate-dock-pulse pointer-events-auto relative flex min-h-[4.5rem] w-full items-center gap-1 rounded-[2rem] p-2",
                "border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(8,8,8,0.34))]",
                "shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-[20px]",
                config.showBackButton && "ml-[4.75rem]",
                config.showChatButton && "mr-[4.75rem]",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute top-2 h-[calc(100%-1rem)] rounded-[1.35rem]",
                  "bg-[linear-gradient(180deg,rgba(255,226,163,0.18),rgba(212,160,23,0.08))]",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_24px_rgba(0,0,0,0.22)]",
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
                "glass-lg pointer-events-auto flex h-[4.5rem] items-center rounded-[2rem] p-2 backdrop-blur-[20px]",
                "animate-scale-in border bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(8,8,8,0.36))] shadow-[0_24px_60px_rgba(0,0,0,0.42)]",
                config.showBackButton ? "ml-[4.75rem]" : "ml-0",
                config.showChatButton ? "mr-[4.75rem]" : "mr-0",
                showTabs ? "absolute inset-x-[5.25rem] bottom-0" : "w-full",
                actionToneClass(config.action.tone),
              )}
            >
              <button
                type="button"
                onClick={config.action.onClick}
                disabled={config.action.disabled || config.action.loading}
                className={cn(
                  "flex h-full w-full items-center justify-center gap-2 rounded-[1.4rem] px-4 text-sm font-semibold",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  config.action.tone === "gold" || !config.action.tone
                    ? "bg-gold text-t-inverse"
                    : "bg-white/8 text-t-primary",
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
        "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.35rem] px-3 py-2.5",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95",
        active ? "text-gold" : "text-t-muted hover:text-t-primary",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "scale-105 drop-shadow-[0_0_14px_rgba(212,160,23,0.28)]")} />
      <span className={cn("truncate text-[0.68rem] font-medium transition-colors duration-300", active && "text-gold")}>
        {tab.label}
      </span>
    </button>
  );
};

const ForwardedNavTabButton = forwardRef<HTMLButtonElement, NavTabButtonProps>(NavTabButton);
ForwardedNavTabButton.displayName = "NavTabButton";

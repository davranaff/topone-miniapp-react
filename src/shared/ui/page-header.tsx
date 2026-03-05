import { ArrowLeft } from "lucide-react";
import { createContext, useContext, type PropsWithChildren, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { useOptionalResolvedShellNav } from "@/widgets/navigation/shell-nav";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backButton?: boolean;
  onBack?: () => void;
  transparent?: boolean;
  sticky?: boolean;
  className?: string;
  titleSize?: "sm" | "md" | "lg";
};

const RootPageHeaderContext = createContext(false);

export const RootPageHeaderProvider = ({ children }: PropsWithChildren) => (
  <RootPageHeaderContext.Provider value>{children}</RootPageHeaderContext.Provider>
);

export const PageHeader = ({
  title,
  subtitle,
  actions,
  backButton = false,
  onBack,
  transparent = false,
  sticky = true,
  className,
  titleSize = "md",
}: PageHeaderProps) => {
  const rootHeaderEnabled = useContext(RootPageHeaderContext);

  if (rootHeaderEnabled) {
    return null;
  }

  const navigate = useNavigate();
  const shellNav = useOptionalResolvedShellNav();
  const shouldRenderTopBackButton = backButton && !shellNav?.showBackButton;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      className={cn(
        "relative",
        sticky && "sticky top-[calc(var(--tg-safe-top,0px)+0.35rem)] z-30",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 py-3 lg:gap-4 lg:py-4",
          sticky &&
            !transparent &&
            "liquid-glass-nav-shell rounded-[1.35rem] px-3 py-3 backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.32)] lg:px-4",
        )}
      >
        {shouldRenderTopBackButton && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className={cn(
              "liquid-glass-chip liquid-glass-surface-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-t-secondary",
              "transition hover:border-gold/40 hover:text-t-primary active:scale-95",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <h1
              className={cn(
                "truncate font-bold text-t-primary",
                titleSize === "sm" && "text-base",
                titleSize === "md" && "text-xl lg:text-2xl",
                titleSize === "lg" && "text-2xl lg:text-[2rem]",
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-t-muted lg:text-[0.95rem]">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
};

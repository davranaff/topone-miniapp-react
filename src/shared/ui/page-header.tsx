import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backButton?: boolean;
  onBack?: () => void;
  transparent?: boolean;
  className?: string;
  titleSize?: "sm" | "md" | "lg";
};

export const PageHeader = ({
  title,
  subtitle,
  actions,
  backButton = false,
  onBack,
  transparent = false,
  className,
  titleSize = "md",
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      className={cn(
        "flex items-center gap-3 py-3",
        !transparent && "",
        className,
      )}
    >
      {backButton && (
        <button
          onClick={handleBack}
          aria-label="Go back"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            "border border-border/60 bg-elevated text-t-secondary",
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
              titleSize === "md" && "text-xl",
              titleSize === "lg" && "text-2xl",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-t-muted">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
};

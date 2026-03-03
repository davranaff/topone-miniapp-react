import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

type ErrorVariant = "generic" | "network" | "not-found" | "forbidden";

type ErrorStateProps = {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
};

const defaults: Record<ErrorVariant, { title: string; description: string; icon: ReactNode }> = {
  generic: {
    title: "Что-то пошло не так",
    description: "Попробуйте обновить страницу или повторить попытку.",
    icon: <AlertTriangle className="h-7 w-7" />,
  },
  network: {
    title: "Нет соединения",
    description: "Проверьте интернет-соединение и повторите попытку.",
    icon: <WifiOff className="h-7 w-7" />,
  },
  "not-found": {
    title: "Не найдено",
    description: "Запрошенный ресурс не существует или был удалён.",
    icon: <span className="text-3xl">🔍</span>,
  },
  forbidden: {
    title: "Нет доступа",
    description: "У вас нет прав для просмотра этого контента.",
    icon: <span className="text-3xl">🔒</span>,
  },
};

export const ErrorState = ({
  variant = "generic",
  title,
  description,
  onRetry,
  retryLabel = "Повторить",
  icon,
  compact = false,
  className,
}: ErrorStateProps) => {
  const def = defaults[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 py-8" : "gap-4 py-14",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 text-danger",
          compact ? "h-12 w-12" : "h-16 w-16",
        )}
      >
        {icon ?? def.icon}
      </div>

      <div className="space-y-1.5 max-w-[260px]">
        <p className={cn("font-semibold text-t-primary", compact ? "text-sm" : "text-base")}>
          {title ?? def.title}
        </p>
        <p className={cn("text-t-muted", compact ? "text-xs" : "text-sm")}>
          {description ?? def.description}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size={compact ? "sm" : "md"}
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

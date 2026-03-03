import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type SectionTitleProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
};

export const SectionTitle = ({
  title,
  subtitle,
  action,
  size = "md",
  className,
  ...props
}: SectionTitleProps) => (
  <div
    className={cn("flex items-start justify-between gap-2", className)}
    {...props}
  >
    <div className="space-y-0.5 min-w-0">
      <h2
        className={cn(
          "font-semibold text-t-primary leading-tight",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-t-muted">{subtitle}</p>
      )}
    </div>
    {action && (
      <div className="shrink-0">{action}</div>
    )}
  </div>
);

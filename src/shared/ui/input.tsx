import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type InputSize = "sm" | "md" | "lg";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: InputSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  error?: boolean;
  wrapperClassName?: string;
};

const sizeClasses: Record<InputSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", leadingIcon, trailingIcon, error, wrapperClassName, ...props }, ref) => {
    const hasLeading = !!leadingIcon;
    const hasTrailing = !!trailingIcon;

    if (!hasLeading && !hasTrailing) {
      return (
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-elevated text-t-primary placeholder:text-t-muted",
            "transition-all duration-200 outline-none",
            "focus:ring-2 focus:ring-gold/40 focus:border-gold/60",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error
              ? "border-danger/60 focus:ring-danger/40 focus:border-danger/60"
              : "border-border/60 hover:border-border",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        {hasLeading && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-t-muted">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-elevated text-t-primary placeholder:text-t-muted",
            "transition-all duration-200 outline-none",
            "focus:ring-2 focus:ring-gold/40 focus:border-gold/60",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error
              ? "border-danger/60 focus:ring-danger/40 focus:border-danger/60"
              : "border-border/60 hover:border-border",
            hasLeading && "pl-9",
            hasTrailing && "pr-9",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />
        {hasTrailing && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-t-muted">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

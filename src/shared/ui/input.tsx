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
  sm: "h-10 px-3.5 text-xs",
  md: "h-12 px-4 text-sm",
  lg: "h-14 px-5 text-base",
};

const inputBaseClasses = [
  "w-full rounded-[1rem] border text-t-primary placeholder:text-t-muted",
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(10,10,10,0.5))]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  "transition-all duration-200 outline-none",
  "focus:ring-2 focus:ring-gold/20 focus:border-gold/45 focus:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(14,14,14,0.56))]",
  "disabled:cursor-not-allowed disabled:opacity-40",
].join(" ");

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", leadingIcon, trailingIcon, error, wrapperClassName, ...props }, ref) => {
    const hasLeading = !!leadingIcon;
    const hasTrailing = !!trailingIcon;

    if (!hasLeading && !hasTrailing) {
      return (
        <input
          ref={ref}
          className={cn(
            inputBaseClasses,
            error
              ? "border-danger/60 focus:ring-danger/30 focus:border-danger/60"
              : "border-white/10 hover:border-white/15",
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
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-t-muted">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            inputBaseClasses,
            error
              ? "border-danger/60 focus:ring-danger/30 focus:border-danger/60"
              : "border-white/10 hover:border-white/15",
            hasLeading && "pl-11",
            hasTrailing && "pr-11",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />
        {hasTrailing && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-t-muted">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

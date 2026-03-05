import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { TopOneLogo } from "@/shared/ui/topone-logo";

export const AuthLogoBadge = () => {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,221,147,0.26),rgba(10,8,4,0.86))] shadow-[inset_0_2px_8px_rgba(255,231,176,0.26),0_18px_36px_rgba(0,0,0,0.5),0_0_36px_rgba(212,160,23,0.2)] backdrop-blur-xl">
      <TopOneLogo size="md" framed={false} />
    </div>
  );
};

export const AuthTitleBlock = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="space-y-3 text-center">
      <AuthLogoBadge />
      <div className="space-y-2">
        <h1 className="font-display text-[2rem] font-extrabold tracking-[-0.05em] text-t-primary sm:text-[2.45rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto max-w-md text-[1rem] leading-7 text-t-secondary sm:text-[1.05rem]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  error?: string;
  wrapperClassName?: string;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon, trailing, error, className, wrapperClassName, ...props }, ref) => {
    return (
      <label className={cn("block space-y-2", wrapperClassName)}>
        <div className="relative">
          <span className="auth-field-label absolute left-4 top-0 z-10 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-[0.76rem] font-semibold tracking-[0.01em] text-t-secondary backdrop-blur-md">
            {label}
          </span>
          <div
            className={cn(
              "liquid-glass-field flex min-h-[4.45rem] items-center rounded-[1.4rem] transition-all duration-200",
              error ? "liquid-glass-field-error" : "focus-within:border-white/30",
            )}
          >
            {icon ? (
              <span className="ml-5 flex h-6 w-6 shrink-0 items-center justify-center text-t-secondary">
                {icon}
              </span>
            ) : null}
            <input
              ref={ref}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent px-4 py-5 text-[1.04rem] text-t-primary outline-none",
                "placeholder:text-t-muted",
                trailing ? "pr-3" : "pr-5",
                props.disabled ? "cursor-not-allowed opacity-60" : undefined,
                className,
              )}
              {...props}
            />
            {trailing ? (
              <span className="mr-4 flex shrink-0 items-center justify-center text-t-secondary">
                {trailing}
              </span>
            ) : null}
          </div>
        </div>
        {error ? <p className="px-1 text-sm text-red-300">{error}</p> : null}
      </label>
    );
  },
);

AuthField.displayName = "AuthField";

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  loading?: boolean;
  variant?: "accent" | "soft" | "ghost";
};

export const AuthPrimaryButton = ({
  icon,
  loading,
  variant = "accent",
  children,
  className,
  disabled,
  ...props
}: AuthPrimaryButtonProps) => {
  const variantClassName =
    variant === "accent"
      ? "bg-[linear-gradient(135deg,rgba(255,237,188,0.98)_0%,rgba(245,200,66,0.96)_42%,rgba(179,117,21,0.92)_100%)] text-[#1d1303] shadow-[inset_0_2px_10px_rgba(255,255,255,0.5),inset_0_-2px_6px_rgba(112,72,11,0.22),0_20px_40px_rgba(212,160,23,0.42)]"
      : variant === "soft"
        ? "bg-[linear-gradient(135deg,rgba(255,228,157,0.44)_0%,rgba(201,135,26,0.38)_100%)] text-[#fbe7b2] shadow-[inset_0_2px_8px_rgba(255,255,255,0.24),inset_0_-2px_5px_rgba(82,53,8,0.24),0_16px_30px_rgba(180,126,26,0.3)]"
        : "liquid-glass-button-link text-t-primary";

  return (
    <button
      className={cn(
        "liquid-glass-surface-interactive flex h-14 w-full items-center justify-center gap-3 rounded-[1.45rem] px-6 text-[1.02rem] font-bold",
        variantClassName,
        "transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
        className,
      )}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
};

export const AuthDivider = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-t-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
};

export const AuthBackButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "liquid-glass-button-icon liquid-glass-surface-interactive inline-flex h-11 w-11 items-center justify-center rounded-full text-t-primary transition-colors hover:text-t-primary",
        className,
      )}
      aria-label="Back"
    >
      <ArrowLeft className="h-7 w-7" />
    </button>
  );
};

export const AuthGlassPanel = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        "auth-glass-panel relative overflow-hidden rounded-[2rem] p-5 backdrop-blur-[26px] sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,231,172,0.16)_0%,rgba(255,231,172,0)_35%),linear-gradient(308deg,rgba(172,112,21,0.16)_0%,rgba(172,112,21,0)_38%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(245,200,66,0.55),transparent)] blur-[0.3px]" />
      <div className="relative">{children}</div>
    </div>
  );
};

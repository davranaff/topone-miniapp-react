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
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.16),rgba(255,255,255,0.02),transparent_72%)] shadow-[0_16px_36px_rgba(0,0,0,0.34)] backdrop-blur-md">
      <TopOneLogo size="md" framed={false} className="drop-shadow-[0_14px_34px_rgba(245,200,66,0.22)]" />
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
        <h1 className="font-display text-[2rem] font-extrabold tracking-[-0.05em] text-white sm:text-[2.45rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto max-w-md text-[1rem] leading-7 text-white/62 sm:text-[1.05rem]">
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
          <span className="absolute left-4 top-0 z-10 -translate-y-1/2 rounded-full bg-[rgba(11,9,6,0.78)] px-2.5 py-0.5 text-[0.76rem] font-semibold tracking-[0.01em] text-white/58 backdrop-blur-md">
            {label}
          </span>
          <div
            className={cn(
              "flex min-h-[4.65rem] items-center rounded-[1.55rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-200",
              error
                ? "ring-1 ring-red-400/70"
                : "ring-1 ring-white/8 focus-within:ring-white/18 focus-within:bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))]",
            )}
          >
            {icon ? (
              <span className="ml-5 flex h-6 w-6 shrink-0 items-center justify-center text-white/58">
                {icon}
              </span>
            ) : null}
            <input
              ref={ref}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent px-4 py-5 text-[1.04rem] text-white outline-none",
                "placeholder:text-white/34",
                trailing ? "pr-3" : "pr-5",
                className,
              )}
              {...props}
            />
            {trailing ? (
              <span className="mr-4 flex shrink-0 items-center justify-center text-white/54">
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
};

export const AuthPrimaryButton = ({
  icon,
  loading,
  children,
  className,
  disabled,
  ...props
}: AuthPrimaryButtonProps) => {
  return (
    <button
      className={cn(
        "flex h-14 w-full items-center justify-center gap-3 rounded-[1.45rem] px-6 text-[1.02rem] font-bold text-white",
        "bg-[linear-gradient(135deg,rgba(238,192,89,0.92)_0%,rgba(209,154,52,0.84)_48%,rgba(145,102,31,0.7)_100%)]",
        "shadow-[0_16px_36px_rgba(181,126,30,0.18),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-lg",
        "transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.99]",
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
      <div className="h-px flex-1 bg-white/15" />
      <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/15" />
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
        "inline-flex h-11 w-11 items-center justify-center rounded-full text-white/92 transition-colors hover:bg-white/8",
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
        "relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-[1px]",
        "shadow-[0_28px_90px_rgba(0,0,0,0.4)]",
        className,
      )}
    >
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[linear-gradient(145deg,rgba(36,27,15,0.34),rgba(10,8,5,0.76))]" />
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] backdrop-blur-xl" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-16 rounded-b-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
};

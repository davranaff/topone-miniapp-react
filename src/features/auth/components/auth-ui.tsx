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
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/8 shadow-[0_10px_28px_rgba(0,0,0,0.3)] ring-1 ring-white/8">
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
        <h1 className="text-[2rem] font-extrabold tracking-[-0.045em] text-white sm:text-[2.4rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto max-w-md text-base leading-7 text-[#d4c3a0] sm:text-[1.05rem]">
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
          <span className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-[rgba(16,10,4,0.92)] px-2 text-[0.9rem] font-semibold tracking-[-0.015em] text-[#f1cf83]">
            {label}
          </span>
          <div
            className={cn(
              "flex min-h-[5rem] items-center rounded-[1.55rem] border bg-[rgba(58,42,8,0.56)]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors duration-200",
              error
                ? "border-red-400/70"
                : "border-[#c79024]/55 focus-within:border-[#f6c768]",
            )}
          >
            {icon ? (
              <span className="ml-5 flex h-6 w-6 shrink-0 items-center justify-center text-[#ffe2a3]/88">
                {icon}
              </span>
            ) : null}
            <input
              ref={ref}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent px-4 py-5 text-[1.1rem] text-white outline-none",
                "placeholder:text-[#ddc38b]/64",
                trailing ? "pr-3" : "pr-5",
                className,
              )}
              {...props}
            />
            {trailing ? (
              <span className="mr-4 flex shrink-0 items-center justify-center text-white/70">
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
        "flex h-16 w-full items-center justify-center gap-3 rounded-[1.55rem] border border-[#ffe2a3]/42",
        "bg-[linear-gradient(135deg,#efc35d_0%,#d9a537_52%,#b88321_100%)] px-6 text-[1.05rem] font-bold text-white",
        "shadow-[0_18px_34px_rgba(212,160,23,0.2),inset_0_1px_0_rgba(255,255,255,0.26)]",
        "transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]",
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

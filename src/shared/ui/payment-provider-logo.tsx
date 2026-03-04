import { cn } from "@/shared/lib/cn";

type PaymentProviderLogoProps = {
  provider: string;
  className?: string;
};

const baseClassName =
  "inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-[11px] font-black uppercase tracking-[0.08em]";

export const PaymentProviderLogo = ({
  provider,
  className,
}: PaymentProviderLogoProps) => {
  const normalized = provider.trim().toLowerCase();

  if (normalized === "click") {
    return (
      <div
        className={cn(
          baseClassName,
          "border-sky-400/30 bg-[radial-gradient(circle_at_top,rgba(67,184,255,0.3),rgba(8,23,36,0.92))] text-sky-200",
          className,
        )}
      >
        <span className="translate-y-[0.5px]">CLICK</span>
      </div>
    );
  }

  if (normalized === "payme") {
    return (
      <div
        className={cn(
          baseClassName,
          "border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(86,231,255,0.34),rgba(8,28,34,0.92))] text-cyan-100",
          className,
        )}
      >
        <span className="translate-y-[0.5px]">PAYME</span>
      </div>
    );
  }

  if (normalized === "tribute") {
    return (
      <div
        className={cn(
          baseClassName,
          "border-violet-300/25 bg-[radial-gradient(circle_at_top,rgba(174,134,255,0.32),rgba(23,16,34,0.92))] text-violet-100",
          className,
        )}
      >
        <span className="translate-y-[0.5px]">TG</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClassName,
        "border-white/10 bg-white/5 text-white/70",
        className,
      )}
    >
      <span>PAY</span>
    </div>
  );
};

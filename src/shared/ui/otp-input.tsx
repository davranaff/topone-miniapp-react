import { OTPInput } from "input-otp";
import { cn } from "@/shared/lib/cn";

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  onComplete?: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  slotClassName?: string;
  activeSlotClassName?: string;
  errorSlotClassName?: string;
};

export const OtpInput = ({
  value,
  onChange,
  maxLength = 6,
  onComplete,
  disabled = false,
  error = false,
  className,
  slotClassName,
  activeSlotClassName,
  errorSlotClassName,
}: OtpInputProps) => {
  return (
    <OTPInput
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      onComplete={onComplete}
      disabled={disabled}
      containerClassName={cn("flex items-center gap-2 justify-center", className)}
      render={({ slots }) => (
        <>
          {slots.map((slot, idx) => (
            <OtpSlot
              key={idx}
              {...slot}
              error={error}
              slotClassName={slotClassName}
              activeSlotClassName={activeSlotClassName}
              errorSlotClassName={errorSlotClassName}
            />
          ))}
        </>
      )}
    />
  );
};

type OtpSlotProps = {
  char: string | null;
  hasFakeCaret: boolean;
  isActive: boolean;
  error?: boolean;
  slotClassName?: string;
  activeSlotClassName?: string;
  errorSlotClassName?: string;
};

const OtpSlot = ({
  char,
  hasFakeCaret,
  isActive,
  error,
  slotClassName,
  activeSlotClassName,
  errorSlotClassName,
}: OtpSlotProps) => (
  <div
    className={cn(
      "relative flex h-12 w-10 items-center justify-center rounded-lg border text-base font-semibold",
      "text-t-primary transition-all duration-200 bg-elevated",
      isActive
        ? cn("border-gold/70 ring-2 ring-gold/30", activeSlotClassName)
        : error
        ? cn("border-danger/60", errorSlotClassName)
        : "border-border/60",
      slotClassName,
    )}
  >
    {char}
    {hasFakeCaret && (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-px animate-pulse bg-gold" />
      </div>
    )}
  </div>
);

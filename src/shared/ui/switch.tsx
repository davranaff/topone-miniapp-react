import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
};

export const Switch = ({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => {
      if (!disabled) {
        onCheckedChange(!checked);
      }
    }}
    className={cn(
      "liquid-glass-button-chip relative h-6 w-11 rounded-full transition-all duration-200",
      checked ? "liquid-glass-button-chip-active" : "text-t-muted",
      disabled && "cursor-not-allowed opacity-50",
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        "absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200",
        checked
          ? "left-[calc(100%-1.375rem)] liquid-glass-accent"
          : "left-0.5 liquid-glass-chip",
      )}
    />
  </button>
);

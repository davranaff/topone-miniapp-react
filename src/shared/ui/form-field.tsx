import * as RadixLabel from "@radix-ui/react-label";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FormFieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export const FormField = ({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) => (
  <div className={cn("flex flex-col gap-2", className)}>
    {label && (
      <RadixLabel.Root
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-[0.82rem] font-semibold tracking-[0.01em] text-white/72"
      >
        {label}
        {required && (
          <span className="text-xs text-gold">*</span>
        )}
      </RadixLabel.Root>
    )}
    {children}
    {hint && !error && (
      <p className="text-xs text-t-muted">{hint}</p>
    )}
    {error && (
      <p className="flex items-center gap-1 text-xs text-danger/95">
        <span>⚠</span>
        {error}
      </p>
    )}
  </div>
);

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export const FormField = ({ label, error, hint, children, className }: FormFieldProps) => {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
};

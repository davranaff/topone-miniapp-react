import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
};

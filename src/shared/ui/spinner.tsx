import { cn } from "@/shared/lib/cn";

type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export const Spinner = ({ size = "md", className }: SpinnerProps) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn(
      "inline-block animate-spin rounded-full",
      "border-gold/20 border-t-gold",
      sizeMap[size],
      className,
    )}
  />
);

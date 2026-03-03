import { cn } from "@/shared/lib/cn";

export const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/80", className)} />;
};

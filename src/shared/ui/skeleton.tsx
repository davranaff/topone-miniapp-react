import { cn } from "@/shared/lib/cn";

type SkeletonProps = {
  className?: string;
  shimmer?: boolean;
};

export const Skeleton = ({ className, shimmer = true }: SkeletonProps) => (
  <div
    data-animate="shimmer"
    className={cn(
      "rounded-lg",
      shimmer
        ? "animate-shimmer bg-shimmer bg-[length:200%_100%]"
        : "bg-elevated",
      className,
    )}
  />
);

export const SkeletonText = ({ lines = 2, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("liquid-glass-surface-muted rounded-2xl p-4 space-y-3", className)}>
    <Skeleton className="h-5 w-2/3" />
    <SkeletonText lines={2} />
    <Skeleton className="h-9 w-full rounded-lg" />
  </div>
);

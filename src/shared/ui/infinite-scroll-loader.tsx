import type { RefObject } from "react";
import { Spinner } from "@/shared/ui/spinner";

type InfiniteScrollLoaderProps = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
};

export const InfiniteScrollLoader = ({
  sentinelRef,
  hasNextPage = false,
  isFetchingNextPage = false,
  className,
}: InfiniteScrollLoaderProps) => {
  if (!hasNextPage && !isFetchingNextPage) {
    return null;
  }

  return (
    <div ref={sentinelRef} className={className ?? "flex justify-center py-2"}>
      {isFetchingNextPage ? <Spinner size="sm" /> : <span className="h-4 w-4" aria-hidden />}
    </div>
  );
};


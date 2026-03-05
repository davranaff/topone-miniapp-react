import { useEffect, useRef } from "react";

type UseInfiniteScrollTriggerParams = {
  enabled?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => unknown;
  rootMargin?: string;
};

export const useInfiniteScrollTrigger = ({
  enabled = true,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  rootMargin = "220px 0px 300px 0px",
}: UseInfiniteScrollTriggerParams) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!enabled || !node || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, hasNextPage, isFetchingNextPage, onLoadMore, rootMargin]);

  return sentinelRef;
};

import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type CarouselItem = {
  id: string;
  content: ReactNode;
};

type FeaturedCarouselProps = {
  items: CarouselItem[];
  className?: string;
  dotClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export const FeaturedCarousel = ({
  items,
  className,
  dotClassName,
  autoPlay = false,
  autoPlayInterval = 4000,
}: FeaturedCarouselProps) => {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      setActive(idx);
      if (autoPlay) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setActive((prev) => (prev + 1) % items.length);
        }, autoPlayInterval);
      }
    },
    [autoPlay, autoPlayInterval, items.length],
  );

  if (!items.length) return null;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        className="flex transition-transform duration-400 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {items.map((item) => (
          <div key={item.id} className="w-full shrink-0">
            {item.content}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className={cn("mt-3 flex items-center justify-center gap-1.5", dotClassName)}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === active
                  ? "h-2 w-5 bg-gold"
                  : "h-2 w-2 bg-border/60 hover:bg-gold/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

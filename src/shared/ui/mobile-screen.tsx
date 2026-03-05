import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type MobileScreenProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  scrollable?: boolean;
  fullHeight?: boolean;
  noPbDock?: boolean;
};

export const MobileScreen = ({
  children,
  className,
  padded = true,
  scrollable = true,
  fullHeight = false,
  noPbDock = false,
  ...props
}: MobileScreenProps) => (
  <div
    className={cn(
      "relative mx-auto w-full",
      "max-w-[80rem]",
      fullHeight && "min-h-[var(--tg-viewport-height,100dvh)]",
      scrollable && "overflow-y-auto overflow-x-visible",
      padded && "px-4 sm:px-5 lg:px-7 xl:px-8",
      !noPbDock &&
        "pb-[calc(7.4rem+env(safe-area-inset-bottom,0px))] lg:pb-[calc(7.8rem+env(safe-area-inset-bottom,0px))]",
      "pt-3 lg:pt-5",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

type MobileScreenSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
};

export const MobileScreenSection = ({
  children,
  className,
  gap = "md",
  ...props
}: MobileScreenSectionProps) => (
  <section
    className={cn(
      gap === "sm" && "space-y-3",
      gap === "md" && "space-y-4",
      gap === "lg" && "space-y-6",
      className,
    )}
    {...props}
  >
    {children}
  </section>
);

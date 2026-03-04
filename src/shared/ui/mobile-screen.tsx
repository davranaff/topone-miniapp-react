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
      "w-full",
      fullHeight && "min-h-screen",
      scrollable && "overflow-y-auto",
      padded && "px-4",
      !noPbDock && "pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]",
      "pt-3",
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

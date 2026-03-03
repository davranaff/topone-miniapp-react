import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  blur?: "sm" | "md" | "lg";
  glow?: boolean;
  goldBorder?: boolean;
  noBorder?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const blurMap = { sm: "glass", md: "glass", lg: "glass-lg" };
const padMap  = { none: "", sm: "p-3", md: "p-4", lg: "p-5" };

export const GlassPanel = ({
  children,
  className,
  blur = "md",
  glow = false,
  goldBorder = false,
  noBorder = false,
  padding = "md",
  ...props
}: GlassPanelProps) => (
  <div
    className={cn(
      "rounded-2xl",
      blurMap[blur],
      padMap[padding],
      glow && "shadow-glow",
      goldBorder && "border-gold/40",
      noBorder && "border-transparent",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

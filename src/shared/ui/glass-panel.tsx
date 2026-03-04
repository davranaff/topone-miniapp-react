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
  style,
  ...props
}: GlassPanelProps) => (
  <div
    className={cn(
      "rounded-2xl",
      blurMap[blur],
      padMap[padding],
      glow && "shadow-glow",
      noBorder && "border-transparent",
      className,
    )}
    style={goldBorder ? { ...style, borderColor: "rgba(212, 160, 23, 0.4)" } : style}
    {...props}
  >
    {children}
  </div>
);

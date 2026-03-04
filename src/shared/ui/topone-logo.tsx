import { cn } from "@/shared/lib/cn";

type TopOneLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  framed?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
} as const;

export const TopOneLogo = ({
  size = "lg",
  framed = true,
  className,
}: TopOneLogoProps) => {
  const image = (
    <img
      src="/topone-logo.png"
      alt="TopOne"
      className={cn("object-contain drop-shadow-[0_8px_20px_rgba(245,200,66,0.2)]", sizeMap[size])}
      loading="eager"
      decoding="async"
    />
  );

  if (!framed) {
    return <div className={cn("relative", className)}>{image}</div>;
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-[2rem] border border-white/10",
        "bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.2),transparent_38%),linear-gradient(180deg,rgba(255,226,163,0.18),rgba(214,163,67,0.08),rgba(18,18,18,0.58))]",
        "shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl",
        size === "sm" && "h-16 w-16",
        size === "md" && "h-20 w-20",
        size === "lg" && "h-24 w-24",
        size === "xl" && "h-28 w-28",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-1 rounded-[1.6rem] border border-white/8" />
      {image}
    </div>
  );
};

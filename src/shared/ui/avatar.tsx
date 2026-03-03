import * as RadixAvatar from "@radix-ui/react-avatar";
import { cn } from "@/shared/lib/cn";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  gold?: boolean;
};

const sizeMap = {
  xs: "h-6 w-6 text-2xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

const ringMap = {
  xs: "ring-1",
  sm: "ring-1",
  md: "ring-2",
  lg: "ring-2",
  xl: "ring-2",
};

export const Avatar = ({
  src,
  alt,
  fallback,
  size = "md",
  className,
  gold = false,
}: AvatarProps) => {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <RadixAvatar.Root
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        sizeMap[size],
        gold
          ? `${ringMap[size]} ring-gold/60 ring-offset-1 ring-offset-base`
          : `${ringMap[size]} ring-border/60 ring-offset-1 ring-offset-base`,
        className,
      )}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={alt ?? fallback ?? "avatar"}
          className="h-full w-full object-cover"
        />
      )}
      <RadixAvatar.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center font-semibold",
          gold
            ? "bg-gold-135 text-t-inverse"
            : "bg-elevated text-t-secondary",
        )}
      >
        {initials}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};

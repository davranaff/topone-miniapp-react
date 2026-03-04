import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
    "liquid-glass-surface-interactive transition-all duration-300 ease-out select-none outline-none will-change-transform",
    "focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Gold filled — primary CTA */
        primary: [
          "liquid-glass-accent text-[#17120a]",
          "hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_24px_42px_rgba(212,160,23,0.2)]",
        ].join(" "),

        /* Outlined gold */
        outline: [
          "liquid-glass-state-gold text-gold",
          "hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10",
        ].join(" "),

        /* Subtle dark fill */
        secondary: [
          "liquid-glass-surface text-t-primary",
          "hover:-translate-y-0.5 hover:border-[color:var(--liquid-glass-stroke-strong)]",
        ].join(" "),

        /* Transparent ghost */
        ghost: [
          "liquid-glass-button-chip text-t-secondary",
          "hover:text-t-primary",
        ].join(" "),

        /* Danger */
        danger: [
          "liquid-glass-state-danger text-danger",
          "hover:bg-danger/20 hover:border-danger/50",
        ].join(" "),

        /* Success */
        success: [
          "liquid-glass-state-success text-success",
          "hover:bg-success/20",
        ].join(" "),

        /* Link style */
        link: "border-transparent bg-transparent text-gold underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md gap-1.5",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-md",
        "icon-lg": "h-12 w-12 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children?: ReactNode;
    asChild?: boolean;
    loading?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </Comp>
  );
};

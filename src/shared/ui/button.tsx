import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
    "transition-all duration-300 ease-out select-none outline-none will-change-transform",
    "focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "active:scale-[0.985]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Gold filled — primary CTA */
        primary: [
          "border border-[#ffe2a3]/35 text-[#17120a]",
          "bg-[linear-gradient(135deg,#f7d27a_0%,#d7a43f_45%,#b67d19_100%)]",
          "shadow-[0_18px_34px_rgba(212,160,23,0.2),inset_0_1px_0_rgba(255,255,255,0.38)]",
          "hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_24px_42px_rgba(212,160,23,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]",
        ].join(" "),

        /* Outlined gold */
        outline: [
          "glass border border-gold/35 bg-[linear-gradient(180deg,rgba(255,226,163,0.08),rgba(18,18,18,0.58))] text-gold",
          "hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10",
        ].join(" "),

        /* Subtle dark fill */
        secondary: [
          "glass border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(18,18,18,0.54))] text-t-primary",
          "hover:-translate-y-0.5 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(18,18,18,0.62))]",
        ].join(" "),

        /* Transparent ghost */
        ghost: [
          "border-transparent bg-transparent text-t-secondary",
          "hover:bg-surface hover:text-t-primary",
        ].join(" "),

        /* Danger */
        danger: [
          "border border-danger/30 bg-danger/10 text-danger",
          "hover:bg-danger/20 hover:border-danger/50",
        ].join(" "),

        /* Success */
        success: [
          "border border-success/30 bg-success/10 text-success",
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

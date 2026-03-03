import * as RadixTabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tab = {
  value: string;
  label: string;
  badge?: string | number;
  icon?: ReactNode;
};

type SegmentedTabsProps = {
  tabs: Tab[];
  value: string;
  onValueChange: (v: string) => void;
  children?: ReactNode;
  className?: string;
  listClassName?: string;
  variant?: "pill" | "line" | "glass";
};

export const SegmentedTabs = ({
  tabs,
  value,
  onValueChange,
  children,
  className,
  listClassName,
  variant = "pill",
}: SegmentedTabsProps) => (
  <RadixTabs.Root
    value={value}
    onValueChange={onValueChange}
    className={cn("w-full", className)}
  >
    <SegmentedTabsList tabs={tabs} variant={variant} className={listClassName} />
    {children}
  </RadixTabs.Root>
);

type SegmentedTabsListProps = {
  tabs: Tab[];
  variant?: "pill" | "line" | "glass";
  className?: string;
};

export const SegmentedTabsList = ({
  tabs,
  variant = "pill",
  className,
}: SegmentedTabsListProps) => (
  <RadixTabs.List
    className={cn(
      "flex w-full items-center",
      variant === "pill" && "rounded-xl bg-elevated p-1 gap-1",
      variant === "line" && "border-b border-border/40 gap-0",
      variant === "glass" && "glass rounded-xl p-1 gap-1",
      className,
    )}
  >
    {tabs.map((tab) => (
      <RadixTabs.Trigger
        key={tab.value}
        value={tab.value}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 text-sm font-medium transition-all duration-200 outline-none",
          variant === "pill" && [
            "rounded-lg py-2 px-3 text-t-muted",
            "data-[state=active]:bg-card data-[state=active]:text-t-primary data-[state=active]:shadow-soft",
          ],
          variant === "line" && [
            "border-b-2 border-transparent px-4 py-3 text-t-muted rounded-none",
            "data-[state=active]:border-gold data-[state=active]:text-gold",
          ],
          variant === "glass" && [
            "rounded-lg py-2 px-3 text-t-muted",
            "data-[state=active]:bg-gold/15 data-[state=active]:text-gold",
          ],
        )}
      >
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-2xs font-semibold",
              "bg-gold/15 text-gold",
            )}
          >
            {tab.badge}
          </span>
        )}
      </RadixTabs.Trigger>
    ))}
  </RadixTabs.List>
);

export const SegmentedTabsContent = RadixTabs.Content;

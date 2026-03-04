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
      variant === "pill" && "liquid-glass-surface-muted rounded-xl p-1 gap-1",
      variant === "line" && "border-b border-border/40 gap-0",
      variant === "glass" && "liquid-glass-surface rounded-xl p-1 gap-1",
      className,
    )}
  >
    {tabs.map((tab) => (
      <RadixTabs.Trigger
        key={tab.value}
        value={tab.value}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 border border-transparent text-sm font-medium transition-all duration-200 outline-none",
          variant === "pill" && [
            "segmented-tab-pill rounded-lg py-2 px-3 text-t-muted",
            "data-[state=active]:shadow-soft",
          ],
          variant === "line" && [
            "border-b-2 border-transparent px-4 py-3 text-t-muted rounded-none",
            "data-[state=active]:border-gold data-[state=active]:text-gold",
          ],
          variant === "glass" && [
            "segmented-tab-glass rounded-lg py-2 px-3 text-t-muted",
          ],
        )}
      >
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-2xs font-semibold",
              "liquid-glass-state-gold text-gold",
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

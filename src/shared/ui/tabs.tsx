import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ children }: { children: ReactNode }) => {
  return <TabsPrimitive.List className="liquid-glass-surface inline-flex rounded-md p-1">{children}</TabsPrimitive.List>;
};

export const TabsTrigger = ({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) => {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "tabs-trigger-liquid rounded-md border border-transparent px-4 py-2 text-sm font-medium text-muted transition data-[state=active]:text-slate-950",
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
};

export const TabsContent = TabsPrimitive.Content;

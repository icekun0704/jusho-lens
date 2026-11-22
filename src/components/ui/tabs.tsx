"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";
import { focusRing } from "./_shared";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

/** Margin Tabs root: owns which panel shows. */
const Tabs = TabsPrimitive.Root;

/**
 * Margin TabsList: a segmented control in the paper field, a filled track
 * with a faint inner shade.
 */
const TabsList = React.forwardRef<HTMLDivElement, WithClassName<TabsPrimitive.List.Props>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-8 items-center justify-center gap-0.5 rounded-lg bg-(--field) p-0.5 text-muted-foreground shadow-(--field-shade)",
        className,
      )}
      {...props}
    />
  ),
);
TabsList.displayName = "TabsList";

/**
 * Margin TabsTrigger: muted text in the track. The active tab is the white
 * toolbar pill with its hairline ring, set into the track.
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, WithClassName<TabsPrimitive.Tab.Props>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Tab
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm",
        "text-muted-foreground transition duration-fast ease-(--ease-out) hover:text-foreground",
        focusRing,
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[active]:bg-card data-[active]:font-medium data-[active]:text-foreground data-[active]:shadow-(--pill-edge)",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  ),
);
TabsTrigger.displayName = "TabsTrigger";

/** Margin TabsContent: the active panel, set below the tab row. */
const TabsContent = React.forwardRef<HTMLDivElement, WithClassName<TabsPrimitive.Panel.Props>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Panel
      ref={ref}
      data-slot="tabs-content"
      className={cn("mt-3 rounded-lg", focusRing, className)}
      {...props}
    />
  ),
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

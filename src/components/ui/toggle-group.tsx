"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "./toggle";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({});

/**
 * Margin ToggleGroup: a segmented control in the paper field, the same track
 * as the Tabs. The pressed item is the paper tab; the group passes its
 * variant and size to every item.
 */
function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: WithClassName<ToggleGroupPrimitive.Props<string>> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "inline-flex flex-wrap items-center gap-0.5 rounded-lg bg-(--field) p-0.5 shadow-(--field-shade)",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}
ToggleGroup.displayName = "ToggleGroup";

/** One item inside a ToggleGroup; it takes the group's variant and size when the group sets them. */
function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: WithClassName<TogglePrimitive.Props<string>> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant: context.variant ?? variant, size: context.size ?? size }),
        // Inside the group the track is shared, so an outline item drops its own ring.
        "rounded-md not-data-[pressed]:ring-0",
        className,
      )}
      {...props}
    />
  );
}
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };

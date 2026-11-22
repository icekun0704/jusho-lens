"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Margin Label: medium weight at 0.875rem above the filled field. A disabled
 * control dims its label too. Base UI has no label primitive, so this is a
 * native label that also watches the data-disabled attribute.
 */
const Label = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<"label">>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 text-sm font-medium leading-none text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export { Label };

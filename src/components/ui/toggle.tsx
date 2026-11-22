"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { focusRing, pressScale, pressedFace } from "./_shared";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

/**
 * Margin Toggle: a small toolbar button that holds its state. Off, it is
 * muted text, or a hairline outline for `outline`. Pressed, it becomes the
 * white toolbar pill in full ink.
 */
const toggleVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg",
    "text-sm text-muted-foreground",
    pressScale,
    focusRing,
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    pressedFace,
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-transparent hover:not-data-[pressed]:bg-accent hover:not-data-[pressed]:text-foreground",
        outline:
          "bg-transparent ring-1 ring-inset ring-input hover:not-data-[pressed]:bg-accent hover:not-data-[pressed]:text-foreground",
      },
      size: {
        sm: "h-7 px-2 text-xs",
        default: "h-7.5 px-2.5 text-sm",
        lg: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** Margin Toggle on Base UI: one toolbar button that stays pressed. */
const Toggle = React.forwardRef<
  HTMLButtonElement,
  WithClassName<TogglePrimitive.Props> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive
    ref={ref}
    data-slot="toggle"
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };

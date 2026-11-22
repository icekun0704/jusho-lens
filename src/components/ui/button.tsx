"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  oxFace,
  oxFaceHover,
  destructiveFace,
  focusRing,
  pillFace,
  pressScale,
  quietFace,
  markFace,
} from "./_shared";

/**
 * Margin Button on a Base UI button: a plain ruled label, near square.
 *
 * The default is the signature: flat oxblood ink inside a darker rule, with
 * no light and no drop. It is the one coloured object on a page,
 * so a page carries one or two. `secondary` is the ruled toolbar tab;
 * `outline` keeps only the hairline; `ghost` shows its face on hover alone;
 * `lit` is the pale oxblood mark. Every press settles it toward the page.
 */
const buttonVariants = cva(
  [
    "inline-flex max-w-full shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap",
    "rounded-lg font-medium",
    pressScale,
    focusRing,
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: cn(oxFace, oxFaceHover),
        primary: cn(oxFace, oxFaceHover),
        lit: markFace,
        solid: cn(oxFace, oxFaceHover),
        secondary: cn(pillFace, "font-normal"),
        outline:
          "bg-transparent text-foreground shadow-(--pill-edge) font-normal hover:bg-accent",
        ghost:
          "bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive: destructiveFace,
        link: "h-auto rounded-sm px-0 text-(--primary-text) underline decoration-current/30 underline-offset-4 hover:decoration-current",
        quiet: quietFace,
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
        icon: "size-9 px-0",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/** Props for the Base UI Button; `asChild` turns a single child element into the button. */
export interface ButtonProps
  extends
    Omit<ButtonPrimitive.Props, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  /**
   * Renders the single child element as the button, for callers written
   * against the Radix API. Base UI composes through `render`.
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild && React.isValidElement(children)) {
      return (
        <ButtonPrimitive
          ref={ref}
          data-slot="button"
          className={classes}
          nativeButton={false}
          {...props}
          render={children}
        />
      );
    }

    return (
      <ButtonPrimitive ref={ref} data-slot="button" className={classes} {...props}>
        {children}
      </ButtonPrimitive>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

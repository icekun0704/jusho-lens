"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";
import { controlChecked, focusRing, slotWell } from "./_shared";

type WithClassName<P> = Omit<P, "className"> & { className?: string };

/**
 * Margin Switch: the small settings switch. Off, the track is a grey slot
 * behind a firmer hairline; on, it takes the primary Button's oxblood face. The
 * white knob slides across with a short ease and a soft shadow under it.
 */
function Switch({ className, ...props }: WithClassName<SwitchPrimitive.Root.Props>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-4.5 w-7.5 shrink-0 cursor-pointer items-center rounded-full p-0.5",
        slotWell,
        controlChecked,
        "transition duration-base ease-(--ease-out)",
        focusRing,
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 rounded-full bg-primary-foreground shadow-(--shadow-thumb)",
          "transition-transform duration-base ease-(--ease-out)",
          "data-[checked]:translate-x-3 data-[unchecked]:translate-x-0 rtl:data-[checked]:-translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
Switch.displayName = "Switch";

export { Switch };

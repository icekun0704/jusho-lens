export const focusRing =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring";

/**
 * The oxblood face: the primary Button's fill, darker oxblood rule.
 * Checkbox, switch, radio and slider wear the same classes on their checked
 * parts, so they read as one material with the button.
 */
export const oxFace =
  "bg-(image:--ox-face) text-primary-foreground shadow-(--ox-edge)";

/** The oxblood face, a step deeper, for hover. */
export const oxFaceHover = "hover:bg-(image:--ox-face-hover)";

/** The darker oxblood rule on its own, around a paper slider thumb. */
export const oxHairline = "shadow-(--ox-hairline)";

/** The pale oxblood mark for a gentle call to action. */
export const markFace =
  "bg-(image:--mark-face) text-(--mark-foreground) shadow-(--mark-edge) hover:brightness-97";

/** The ruled toolbar tab: a hairline ring and a shadow one step above flat. */
export const pillFace =
  "bg-card text-foreground shadow-(--pill-edge) " +
  "transition duration-fast ease-(--ease-out) " +
  "hover:bg-(--pill-face-hover) hover:shadow-(--pill-edge-hover)";

/** The quiet face: a step of paper for quiet buttons and neutral chips. */
export const quietFace =
  "bg-(--field) text-foreground shadow-(--field-shade) " +
  "transition duration-fast ease-(--ease-out) hover:bg-(--field-hover)";

/** The red face for a destructive action, as flat as the oxblood. */
export const destructiveFace =
  "bg-(image:--destructive-face) text-destructive-foreground shadow-xs hover:brightness-105";

/** The sheet: a paper face bounded by one hairline, with no drop. */
export const sheetSurface = "bg-card text-card-foreground shadow-(--shadow-card)";

/** The desk: one paper step below a card, for nested areas. */
export const canvasSurface = "bg-muted text-card-foreground shadow-(--shadow-card)";

/** The slot: tracks and resting switch wells, sunk behind a firmer hairline. */
export const slotWell = "bg-(--field) shadow-(--slot-edge)";

/** The press every button shares: a small scale toward the page. */
export const pressScale =
  "transition duration-fast ease-(--ease-out) active:scale-97 motion-reduce:active:scale-100";

/**
 * Base styles shared by every form-field surface: a clean sheet inside a
 * firm rule. On focus it takes an oxblood edge and wears the oxblood halo. The transparent border is there
 * so an invalid field can turn it red.
 */
export const formFieldBase =
  "w-full min-w-0 rounded-lg border border-transparent bg-(--field) px-3 text-sm text-foreground " +
  "shadow-(--field-edge) placeholder:text-muted-foreground " +
  "transition duration-fast ease-(--ease-out) " +
  "focus-visible:outline-none focus-visible:border-primary/45 focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

/** Height and vertical padding for single-line form fields (2.25rem). */
export const formFieldSingleLine = "flex h-9 py-1.5";

/** Vertical padding and min-height for multi-line form fields. */
export const formFieldMultiLine = "flex min-h-24 py-2 leading-normal";

/** The floating panel shared by every menu, popover, select and tooltip. */
export const popoverSurface =
  "rounded-xl bg-popover text-popover-foreground shadow-(--shadow-menu) outline-none";

/** A row inside a floating panel; the highlighted row turns a step of paper. */
export const menuItemBase =
  "relative flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2.5 text-sm outline-none " +
  "transition-colors duration-fast " +
  "focus:bg-(--field) focus:text-accent-foreground data-[highlighted]:bg-(--field) data-[highlighted]:text-accent-foreground " +
  "data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground " +
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

/**
 * A checked small control (checkbox box, radio, switch track) in the oxblood
 * face. Radix marks it with data-state="checked"; Base UI with data-checked.
 */
export const controlChecked =
  "data-[state=checked]:bg-(image:--ox-face) data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-(--ox-edge) " +
  "data-[checked]:bg-(image:--ox-face) data-[checked]:text-primary-foreground data-[checked]:shadow-(--ox-edge)";

/** A field whose popup is open keeps its focus look, so it reads as active. */
export const fieldOpen =
  "data-[popup-open]:border-primary/45 data-[popup-open]:bg-card data-[popup-open]:ring-3 data-[popup-open]:ring-ring";

/** Popups grow from their anchor and fade, and leave the same way. */
export const popupMotion =
  "origin-(--transform-origin) transition-[opacity,scale] duration-fast ease-(--ease-out) " +
  "data-[starting-style]:scale-97 data-[starting-style]:opacity-0 " +
  "data-[ending-style]:scale-97 data-[ending-style]:opacity-0";

/** The popover settles at the base duration, both ways. */
export const popoverMotion =
  "origin-(--transform-origin) transition-[opacity,scale] duration-base ease-(--ease-out) " +
  "data-[starting-style]:scale-97 data-[starting-style]:opacity-0 " +
  "data-[ending-style]:scale-97 data-[ending-style]:opacity-0";

/** A pressed toggle or chip rises out of the field as the paper tab. */
export const pressedFace =
  "data-[pressed]:bg-card data-[pressed]:text-foreground data-[pressed]:shadow-(--pill-edge)";

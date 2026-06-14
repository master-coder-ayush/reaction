import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "green"
  | "blue"
  | "purple"
  | "teal"
  | "orange"
  | "pink"
  | "amber"
  | "red"
  | "slate";

const SOLID: Record<BadgeTone, string> = {
  green: "bg-primary text-primary-foreground",
  blue: "bg-secondary text-secondary-foreground",
  purple: "bg-accent text-accent-foreground",
  teal: "bg-info text-info-foreground",
  orange: "bg-warn text-warn-foreground",
  pink: "bg-pink text-pink-foreground",
  amber: "bg-warning text-warning-foreground",
  red: "bg-destructive text-destructive-foreground",
  slate: "bg-foreground text-background",
};

const SOFT: Record<BadgeTone, string> = {
  green: "bg-primary-soft text-primary-border",
  blue: "bg-secondary-soft text-secondary-border",
  purple: "bg-accent-soft text-accent-border",
  teal: "bg-info-soft text-info-border",
  orange: "bg-warn-soft text-warn-border",
  pink: "bg-pink-soft text-pink-border",
  amber: "bg-warning-soft text-warn-border",
  red: "bg-destructive-soft text-destructive-border",
  slate: "bg-muted text-muted-foreground",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Soft tinted style instead of solid fill. */
  soft?: boolean;
};

/** Small colored pill for statuses, counts, labels, and tags. */
export function Badge({
  className,
  tone = "slate",
  soft = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
        soft ? SOFT[tone] : SOLID[tone],
        className
      )}
      {...props}
    />
  );
}

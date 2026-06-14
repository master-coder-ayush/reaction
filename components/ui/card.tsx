import * as React from "react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "purple" | "green" | "orange" | "pink" | "teal";

const ACCENT_BAR: Record<Accent, string> = {
  blue: "before:bg-secondary",
  purple: "before:bg-accent",
  green: "before:bg-primary",
  orange: "before:bg-warn",
  pink: "before:bg-pink",
  teal: "before:bg-info",
};

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Adds a colored top accent bar in the chosen hue. */
  accent?: Accent;
  /** Subtle lift on hover (use for clickable cards). */
  hover?: boolean;
};

/**
 * Soft, modern surface card. Default look is unchanged for existing callers
 * (`<Card>` with no new props). `accent` adds a colored top bar; `hover` adds a
 * gentle lift for interactive cards.
 */
export function Card({ className, accent, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-soft",
        hover &&
          "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-lg",
        accent &&
          cn(
            "relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:content-['']",
            ACCENT_BAR[accent]
          ),
        className
      )}
      {...props}
    />
  );
}

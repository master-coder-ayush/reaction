import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "accent"
    | "info"
    | "warn";
  size?: "sm" | "md" | "lg";
};

/**
 * Chunky, Duolingo-style button: a solid colored bottom edge that the button
 * presses into on click (`.btn-chunky`). The original
 * `primary | secondary | destructive | outline | ghost` API is preserved;
 * `accent | info | warn` and the optional `size` are additive.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const chunky = variant !== "ghost" && variant !== "outline";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold tracking-wide transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "h-9 px-4 text-xs",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-13 px-7 text-base",
          chunky && "btn-chunky",
          variant === "primary" &&
            "border-(--primary-border) bg-primary text-primary-foreground",
          variant === "secondary" &&
            "border-(--secondary-border) bg-secondary text-secondary-foreground",
          variant === "accent" &&
            "border-(--accent-border) bg-accent text-accent-foreground",
          variant === "info" &&
            "border-(--info-border) bg-info text-info-foreground",
          variant === "warn" &&
            "border-(--warn-border) bg-warn text-warn-foreground",
          variant === "destructive" &&
            "border-(--destructive-border) bg-destructive text-destructive-foreground",
          variant === "outline" &&
            "border-2 border-border bg-card text-foreground shadow-[0_4px_0_var(--border)] hover:-translate-y-px active:translate-y-0.5 active:shadow-none",
          variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

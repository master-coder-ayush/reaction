import * as React from "react";
import { cn } from "@/lib/utils";

export type StatTone = "green" | "blue" | "purple" | "teal" | "orange" | "pink" | "amber";

const CHIP: Record<StatTone, string> = {
  green: "bg-primary-soft text-primary-border",
  blue: "bg-secondary-soft text-secondary-border",
  purple: "bg-accent-soft text-accent-border",
  teal: "bg-info-soft text-info-border",
  orange: "bg-warn-soft text-warn-border",
  pink: "bg-pink-soft text-pink-border",
  amber: "bg-warning-soft text-warn-border",
};

type StatCardProps = {
  /** A lucide icon element, e.g. `<Flame className="h-5 w-5" />`. */
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: StatTone;
  className?: string;
};

/** Compact colored statistic tile: icon chip + value + label. */
export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "blue",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft",
        className
      )}
    >
      {icon != null && (
        <span className={cn("icon-chip", CHIP[tone])} aria-hidden>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="text-xl font-extrabold leading-tight tabular-nums">
          {value}
        </div>
        <div className="truncate text-xs font-semibold text-muted-foreground">
          {label}
        </div>
        {hint != null && (
          <div className="truncate text-xs text-muted-foreground">{hint}</div>
        )}
      </div>
    </div>
  );
}

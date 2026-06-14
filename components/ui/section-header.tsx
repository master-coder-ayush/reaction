import * as React from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** A lucide icon element. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional right-aligned action (link/button). */
  action?: React.ReactNode;
  className?: string;
};

/** Consistent section heading with an optional colored icon and trailing action. */
export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-3", className)}>
      <div className="flex items-center gap-2.5">
        {icon != null && (
          <span className="text-foreground" aria-hidden>
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          {subtitle != null && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </div>
  );
}

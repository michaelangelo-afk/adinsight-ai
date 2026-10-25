import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader — the workspace's page-level masthead.
 *
 * One pattern everywhere: an optional 11px eyebrow, a 24px title, a single line
 * of muted context, and actions on the right. It replaces the gradient hero
 * bands that used to open each page (which consumed a third of the viewport and
 * pushed the actual data below the fold).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col justify-between gap-4 md:flex-row md:items-end",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="stat-label flex items-center gap-1.5">{eyebrow}</div>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-mist-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-mist-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

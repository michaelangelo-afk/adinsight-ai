import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Panel — the single card primitive in the workspace.
 *
 * Every surface is the same object: navy fill, 1px 7%-white border, 12px
 * radius, no shadow. Hierarchy comes from the header type scale and from what
 * sits inside, not from a stack of different card styles.
 */
export function Panel({
  className,
  children,
  as: Tag = "section",
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn("glass-card rounded-xl", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * PanelHeader — eyebrow + title + optional description, with actions pinned
 * right. `compact` drops the description and tightens the rhythm for the
 * smaller secondary panels (platform mix, schedule, etc.).
 */
export function PanelHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  className
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        compact && "items-center",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="stat-label flex items-center gap-1.5">{eyebrow}</div>
        )}
        <h3
          className={cn(
            "font-semibold tracking-tight text-mist-50",
            eyebrow ? "mt-1" : "",
            compact ? "text-[13px]" : "text-sm"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-[12px] leading-relaxed text-mist-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Divider used between a panel header and its body. */
export function PanelRule({ className }: { className?: string }) {
  return <div className={cn("h-px bg-white/[0.06]", className)} />;
}

import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "brand"
  | "accent"
  | "neutral"
  | "good"
  | "warn"
  | "bad";

// Phase 7 — each tone now declares a full light + dark twin so badges
// stay legible on both surfaces. `rounded-full` is preserved because
// badges are STATUS chips by design (status pills, not buttons).
const tones: Record<Tone, string> = {
  brand:
    "bg-brand-100/80 text-brand-700 border-brand-200 " +
    "dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30",
  accent:
    "bg-brand-100/80 text-brand-700 border-brand-200 " +
    "dark:bg-brand-600/15 dark:text-brand-300 dark:border-brand-600/30",
  neutral:
    "bg-slate-100 text-slate-600 border-mist-200 " +
    "dark:bg-mist-50/[0.05] dark:text-mist-200 dark:border-mist-50/10",
  good:
    "bg-brand-100/80 text-brand-700 border-brand-200 " +
    "dark:bg-brand-600/15 dark:text-brand-300 dark:border-brand-600/30",
  warn:
    "bg-amber-100/80 text-amber-700 border-amber-200 " +
    "dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  bad:
    "bg-rose-100/80 text-rose-700 border-rose-200 " +
    "dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
};

export function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

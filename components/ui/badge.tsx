import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "violet"
  | "naira"
  | "neutral"
  | "good"
  | "warn"
  | "bad";

// Phase 7 — each tone now declares a full light + dark twin so badges
// stay legible on both surfaces. `rounded-full` is preserved because
// badges are STATUS chips by design (status pills, not buttons).
const tones: Record<Tone, string> = {
  violet:
    "bg-violet-100/80 text-violet-700 border-violet-200 " +
    "dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
  naira:
    "bg-emerald-100/80 text-emerald-700 border-emerald-200 " +
    "dark:bg-naira-600/15 dark:text-naira-300 dark:border-naira-600/30",
  neutral:
    "bg-slate-100 text-slate-600 border-mist-200 " +
    "dark:bg-mist-50/[0.05] dark:text-mist-200 dark:border-mist-50/10",
  good:
    "bg-emerald-100/80 text-emerald-700 border-emerald-200 " +
    "dark:bg-naira-600/15 dark:text-naira-300 dark:border-naira-600/30",
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

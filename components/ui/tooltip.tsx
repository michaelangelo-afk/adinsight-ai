"use client";

// components/ui/tooltip.tsx
//
// Lightweight educational tooltip primitive for the dashboard.
// Renders a small info icon next to children + a flat popover on
// hover/focus with annotated metric explanations.
//
// Not general-purpose: positions top / bottom with no collision
// detection, no portal, no delay tuning. Sufficient for the twelve
// educational hotspots on /dashboard (MetricsGrid, TrendChart,
// PlatformChart, CampaignsTable, RecommendationsPanel, AccountsStrip).
//
// Accessibility:
//   - aria-describedby wires the popover to the inner content span
//     once open so screen readers announce it.
//   - onMouseEnter/Leave + onFocusCapture/BlurCapture cover both
//     pointer and keyboard triggers.
//   - The Info button is keyboard-focusable so the popover can be
//     revealed without touching a mouse.

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricTooltipProps {
  /** Rich content rendered inside the popover */
  content: React.ReactNode;
  /** Accessible label for the info button (e.g. "What ROI means") */
  label: string;
  /** Trigger element(s) — usually the metric label or value text */
  children: React.ReactNode;
  /** Optional className merged with the wrapper */
  className?: string;
  /** Popover placement; default "top" */
  side?: "top" | "bottom";
  /** When true, hide the info icon (still hover-triggered by children) */
  hideIcon?: boolean;
}

export function MetricTooltip({
  content,
  label,
  children,
  className,
  side = "top",
  hideIcon = false
}: MetricTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <span
      className={cn(
        "relative inline-flex items-baseline",
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        // Close only when focus leaves the wrapper entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <span
        aria-describedby={open ? id : undefined}
        className="inline-flex items-baseline"
      >
        {children}
      </span>
      {!hideIcon && (
        <button
          type="button"
          aria-label={label}
          tabIndex={0}
          className={cn(
            "ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full",
            "text-mist-400 hover:text-violet-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60",
            "transition-colors duration-150 cursor-help"
          )}
        >
          <Info size={11} strokeWidth={2.25} aria-hidden="true" />
        </button>
      )}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 w-72 px-3.5 py-3 rounded-xl",
            "bg-ink-900/95 backdrop-blur-sm",
            "border border-violet-500/30 shadow-2xl",
            "text-xs leading-relaxed text-mist-100",
            "pointer-events-none animate-fade-up text-left",
            side === "top"
              ? "bottom-full left-0 mb-2"
              : "top-full left-0 mt-2"
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

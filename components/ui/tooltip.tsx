"use client";

// components/ui/tooltip.tsx
//
// Educational metric-tooltip popover. Two-stage rendering:
//
//   1. The TRIGGER span lives inline in the parent JSX. It owns the
//      hover/focus state and the Info-icon button. Its getBoundingClientRect
//      tells us where the popover should sit.
//
//   2. The POPOVER span is rendered into document.body via createPortal
//      with `position: fixed`. This escapes every stacking context
//      (cards' glass-card backdrop-filter, hover-lift transforms, etc.)
//      so the popover is always visually on top of everything else.
//
// Why a Portal instead of z-50:
//   - glass-card uses `backdrop-filter: blur(20px)` which creates a new
//     stacking context, so `z-50` inside the card REMAINS below the
//     sibling card's `z-50` even though both are siblings in the layout.
//   - hover-lift writes a transform on hover; transform creates a stacking
//     context too. So even single-card tooltips trap after first hover.
//   - Portal at body + position: fixed bypasses ALL parent stacking
//     contexts. Side effect: we have to compute coordinates manually,
//     which we do in useLayoutEffect using both trigger and popover rects.
//
// Why a useLayoutEffect (and not useEffect):
//   - The popover renders inside the trigger span's bounding box the
//     first frame. useLayoutEffect runs synchronously after commit
//     but BEFORE paint, so the user only ever sees the final clamped
//     position — no flicker.
//
// Why we remeasure on scroll/resize:
//   - Tooltip should stay attached to its trigger visually even as
//     the page scrolls or the viewport rotates.

import * as React from "react";
import { createPortal } from "react-dom";
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
  /** Popover placement preference; default "top" */
  side?: "top" | "bottom";
  /** When true, hide the info icon (still hover-triggered by children) */
  hideIcon?: boolean;
}

/** Width is hard-coded so the position calculation doesn't depend on
 *  the popover having rendered yet. Must match the w-72 utility. */
const POPOVER_WIDTH_PX = 288;

/** Minimum gap between popover edge and viewport edge. */
const VIEWPORT_GAP_PX = 8;

export function MetricTooltip({
  content,
  label,
  children,
  className,
  side = "top",
  hideIcon = false
}: MetricTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ left: -9999, top: -9999 });
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const popoverRef = React.useRef<HTMLSpanElement>(null);
  const id = React.useId();

  React.useLayoutEffect(() => {
    if (!open) return;

    const compute = () => {
      const trigger = triggerRef.current;
      const pop = popoverRef.current;
      if (!trigger || !pop) return;

      const tr = trigger.getBoundingClientRect();
      const pr = pop.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = VIEWPORT_GAP_PX;

      // Vertical: prefer the requested side, flip if it would overflow,
      // then clamp to the viewport.
      let top: number;
      if (side === "bottom") {
        top = tr.bottom + gap;
        if (top + pr.height > vh - gap) {
          // flip up
          top = Math.max(gap, tr.top - pr.height - gap);
        }
      } else {
        top = tr.top - pr.height - gap;
        if (top < gap) {
          // flip down
          top = Math.min(vh - pr.height - gap, tr.bottom + gap);
        }
      }

      // Horizontal: center on trigger; clamp to viewport so the popover
      // never escapes the screen edge on mobile.
      const horizontalCenter = tr.left + tr.width / 2;
      let left = horizontalCenter - pr.width / 2;
      left = Math.max(gap, Math.min(vw - pr.width - gap, left));

      setCoords({ left, top });
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true); // capture: scroll inside any container
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, side]);

  const triggerNode = (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex items-baseline", className)}
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
            "text-mist-600 hover:text-violet-700",
            "dark:text-mist-400 dark:hover:text-violet-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60",
            "transition-colors duration-150 cursor-help"
          )}
        >
          <Info size={11} strokeWidth={2.25} aria-hidden="true" />
        </button>
      )}
    </span>
  );

  // SSR — createPortal cannot run server-side. Skip the popover there;
  // the trigger renders alone until hydration completes.
  if (typeof document === "undefined") return triggerNode;

  return (
    <>
      {triggerNode}
      {open &&
        createPortal(
          <span
            id={id}
            ref={popoverRef}
            role="tooltip"
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              width: POPOVER_WIDTH_PX,
              zIndex: 9999
            }}
            className={cn(
              "px-3.5 py-3 rounded-xl",
              "bg-white text-mist-700 border border-violet-300/60 shadow-2xl",
              "dark:bg-ink-900/95 dark:text-mist-100 dark:border-violet-500/30",
              "text-xs leading-relaxed text-left",
              "pointer-events-none animate-fade-up"
            )}
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pattern system — "instrument field".
 *
 * Five motifs on one 8px base unit. Every motif draws with
 * `rgb(var(--pattern-ink) / α)` (see app/globals.css) so the layer is white on
 * ink at night and ink on paper by day without a second implementation.
 *
 * Placement rules:
 *  - A pattern is a SURFACE, not a texture over content: it always sits at
 *    `-z-10` inside an `isolate` section, is `aria-hidden`, never receives
 *    pointer events, and carries a mask that fades it to zero before type.
 *  - Never stack two motifs in the same corner; one motif per section edge.
 *  - Pitch is fixed: grid 64/16, dots 16, bars 6+8, hatch 45°/8.
 */

type Motif = "grid" | "dots" | "bars" | "hatch";

const MOTIF: Record<Motif, string> = {
  grid: "pattern-grid",
  dots: "pattern-dots",
  bars: "pattern-bars",
  hatch: "pattern-hatch"
};

type Mask =
  | "radial"
  | "top"
  | "bottom"
  | "edges"
  | "corner-tr"
  | "corner-bl"
  | "none";

const MASK: Record<Mask, string> = {
  radial: "pattern-mask-radial",
  top: "pattern-mask-top",
  bottom: "pattern-mask-bottom",
  edges: "pattern-mask-edges",
  "corner-tr": "pattern-mask-corner-tr",
  "corner-bl": "pattern-mask-corner-bl",
  none: ""
};

export function PatternField({
  motif,
  mask = "radial",
  className,
  opacity = 100
}: {
  motif: Motif;
  mask?: Mask;
  /** Position and size live here — e.g. "inset-0", "h-40 bottom-0". */
  className?: string;
  /** Percent, applied as a multiplier on the motif's own alpha. */
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10",
        MOTIF[motif],
        MASK[mask],
        className
      )}
      style={opacity === 100 ? undefined : { opacity: opacity / 100 }}
    />
  );
}

/**
 * Signal rings — concentric circles on a fixed 56px step.
 *
 * Dashed/solid alternate so the field reads as a measuring instrument rather
 * than a target. 1px strokes at 14% ink; the outermost ring is the only one
 * allowed to fade out (the radial mask does it).
 */
export function SignalRings({
  className,
  rings = 6,
  step = 56,
  dashedEvery = 2
}: {
  className?: string;
  rings?: number;
  step?: number;
  dashedEvery?: number;
}) {
  const size = step * rings * 2 + 8;
  const c = size / 2;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      className={cn("pointer-events-none absolute -z-10", className)}
      fill="none"
    >
      {Array.from({ length: rings }).map((_, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={step * (i + 1)}
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity={i === 0 ? 0.18 : 0.12}
          strokeDasharray={i % dashedEvery === 0 ? undefined : "1 6"}
        />
      ))}
      {/* Cardinal ticks: 1px, 8px long, at 90° intervals. */}
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1={c}
          y1={c - step * rings - 4}
          x2={c}
          y2={c - step * rings + 4}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
          transform={`rotate(${deg} ${c} ${c})`}
        />
      ))}
    </svg>
  );
}

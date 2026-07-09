"use client";

// GradientBeam
//
// Renders an SVG path (faint dashed line) plus one bright gradient
// particle that travels along it from start → end. Used in the
// Workflow section as a premium alternative to a static dashed arrow.
//
// API:
//   <GradientBeam d="M 0 12 L 56 12" width={56} height={24} />
//
// Implementation detail: we use SVG SMIL-free approach — a motion.div
// is positioned via CSS `motion-path`-style tactic (skipping it for
// cross-browser compat) instead we extract sample points along the
// path with `getPointAtLength()` and animate `transform: translate`.
// On reduced-motion: just renders the dashed path with no particle.

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface GradientBeamProps {
  /** Path "d" attribute (use the same path as any sibling static SVG) */
  d: string;
  /** SVG width (px) — used for viewBox + path length sampling */
  width: number;
  /** SVG height (px) */
  height: number;
  /** Particle size in px */
  particleSize?: number;
  /** Travel duration in seconds */
  duration?: number;
  /** Color of the trailing light */
  color?: string;
  className?: string;
  /** When true, render only the static dashed path (used as fallback in
   *  tests or low-power devices). */
  staticOnly?: boolean;
}

interface Point {
  x: number;
  y: number;
}

/** Sample N evenly-spaced points along an SVG path. Returns Point[]
 * in viewBox coordinates (matching the SVG width/height). */
function samplePath(
  d: string,
  pathEl: SVGPathElement | null,
  count: number
): Point[] {
  if (!pathEl) return [];
  const total = pathEl.getTotalLength();
  if (!total || !isFinite(total)) return [];
  const pts: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const p = pathEl.getPointAtLength((i / count) * total);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

export function GradientBeam({
  d,
  width,
  height,
  particleSize = 4,
  duration = 4.5,
  color = "#10B981",
  className,
  staticOnly = false
}: GradientBeamProps) {
  const reduceMotion = useReducedMotion();
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const [pts, setPts] = React.useState<Point[]>([]);

  // After mount, sample the path so we have static coordinates to
  // animate through. The path reference is required for getPointAtLength,
  // so this MUST be a client component (already is). Re-sample if d
  // changes.
  React.useEffect(() => {
    if (staticOnly) return;
    const sampled = samplePath(d, pathRef.current, 24);
    setPts(sampled);
  }, [d, staticOnly]);

  // Build a smooth sequences of (x,y) keyframes matching `pts`.
  // Each transition is `duration / pts.length` so the particle flows
  // at constant velocity.
  const keyframes = React.useMemo(() => {
    if (pts.length === 0) return undefined;
    return {
      x: pts.map((p) => p.x),
      y: pts.map((p) => p.y)
    };
  }, [pts]);

  return (
    <svg
      aria-hidden
      className={"pointer-events-none " + (className ?? "")}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <defs>
        <linearGradient id={`beam-${color.replace("#", "")}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Static faint dashed path. Provides the "rail" the particle
          travels on. */}
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 4"
        fill="none"
      />
      {/* The particle itself. Hidden until we have sampled pts. */}
      {staticOnly || reduceMotion || !keyframes ? null : (
        <motion.circle
          r={particleSize}
          fill={`url(#beam-${color.replace("#", "")})`}
          initial={{ x: keyframes.x[0], y: keyframes.y[0], opacity: 0 }}
          animate={{
            x: keyframes.x,
            y: keyframes.y,
            opacity: [0, 1, 1, 1, 0]
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.08, 0.5, 0.9, 1]
          }}
          style={{
            filter: `drop-shadow(0 0 4px ${color})`
          }}
        />
      )}
    </svg>
  );
}

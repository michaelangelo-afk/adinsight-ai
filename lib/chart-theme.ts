/**
 * Chart tokens. Recharts takes inline styles, so the palette and chrome live
 * here instead of being retyped (and drifting) in each chart component.
 *
 * Colour is meaning-bearing, not decorative: green is the money metric, blue
 * the volume metric, violet the reach metric. Never use two near-identical
 * hues for two series in the same chart.
 */
import type { CSSProperties } from "react";

export const SERIES = {
  green: "#34D399",
  blue: "#60A5FA",
  violet: "#A78BFA",
  amber: "#FBBF24",
  rose: "#FB7185"
} as const;

export type SeriesTone = keyof typeof SERIES;

export const AXIS_TICK = {
  fill: "#7F8CA3",
  fontSize: 10.5
} as const;

export const GRID = {
  stroke: "rgba(255,255,255,0.055)",
  strokeDasharray: "3 3",
  vertical: false
} as const;

export const TOOLTIP_STYLE: CSSProperties = {
  background: "#101725",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 10,
  boxShadow: "0 12px 32px -12px rgba(0,0,0,0.85)",
  padding: "10px 12px",
  color: "#F3F6FB",
  fontSize: 12
};

export const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "#A4B0C4",
  fontSize: 11,
  marginBottom: 4
};

/** Vertical gradient id helper for an area fill at a given tone. */
export function areaGradientId(tone: SeriesTone): string {
  return `area-${tone}`;
}

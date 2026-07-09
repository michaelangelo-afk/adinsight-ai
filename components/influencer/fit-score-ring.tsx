// components/influencer/fit-score-ring.tsx
//
// "use client" — animated SVG ring driven by framer-motion's `useSpring`.
// The score transition is spring-based, so cards re-rendering with a
// new fit value animate the ring smoothly rather than snapping.
//
// Reduced-motion: we render the same SVG with strokeDashoffset set
// directly to the final value (no animation) so the metric is still
// visible to motion-sensitive readers.

"use client";

import { motion, useSpring, useReducedMotion, useTransform } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

const RADIUS_DEFAULT = 26;
const CIRCUMFERENCE_DEFAULT = 2 * Math.PI * RADIUS_DEFAULT;

function fitTone(score: number): {
  stroke: string;
  glow: string;
  label: string;
} {
  if (score >= 80) {
    return {
      stroke: "#10B981", // naira-500 — strong emerald, premium-positive
      glow: "rgba(16,185,129,0.45)",
      label: "Top fit"
    };
  }
  if (score >= 65) {
    return {
      stroke: "#34D399", // naira-400 — warm emerald
      glow: "rgba(52,211,153,0.38)",
      label: "Strong fit"
    };
  }
  if (score >= 45) {
    return {
      stroke: "#A78BFA", // violet-300 — neutral / "explore"
      glow: "rgba(167,139,250,0.30)",
      label: "Decent fit"
    };
  }
  return {
    stroke: "#94A3B8", // mist-400 — low
    glow: "rgba(148,163,184,0.25)",
    label: "Low fit"
  };
}

export interface FitScoreRingProps {
  /** 0..100 composite score */
  score: number;
  /** Visual size preset */
  size?: "sm" | "md" | "lg";
  /** Stagger delay (ms) for the entrance animation. */
  delay?: number;
  /** Compact label below the number. */
  showLabel?: boolean;
  className?: string;
  /** aria-label override (otherwise we use score + tone label). */
  ariaLabel?: string;
}

const SIZE_PRESETS = {
  sm: { px: 56, ring: 22, stroke: 4, font: "text-xs", scoreFont: "text-base" },
  md: { px: 72, ring: 30, stroke: 5, font: "text-[11px]", scoreFont: "text-lg" },
  lg: { px: 96, ring: 42, stroke: 6, font: "text-xs", scoreFont: "text-2xl" }
};

export function FitScoreRing({
  score,
  size = "md",
  delay = 0,
  showLabel = true,
  className,
  ariaLabel
}: FitScoreRingProps) {
  const reduce = useReducedMotion();
  const preset = SIZE_PRESETS[size];
  const r = preset.ring;
  const C = 2 * Math.PI * r;
  // Stable React-unique id so SVG <linearGradient> defs don't collide
  // when two creators share the same integer fit score. Without it,
  // the first ring's gradient paint takes over subsequent rings.
  const gradientId = useId();

  // Spring-driven animated value; 0..1 → strokeDashoffset dispC * 1 - ratio
  const animated = useSpring(0, {
    stiffness: 80,
    damping: 20,
    mass: 0.6
  });

  const dashoffset = useTransform(animated, (v) => C * (1 - v));
  const dashoffsetReduced = C * (1 - Math.max(0, Math.min(1, score / 100)));

  // Mount → animate to target value (skip if reduced motion).
  // Effect-like entropy trade: we just dispatch a set in a microtask so
  // the spring starts at 0 then animates in.
  if (typeof window !== "undefined") {
    queueMicrotask(() => {
      if (reduce) {
        animated.jump(dashoffsetReduced);
      } else {
        animated.set(score / 100);
      }
    });
  }

  const tone = fitTone(score);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: preset.px, height: preset.px, animationDelay: `${delay}ms` }}
      role="img"
      aria-label={ariaLabel ?? `Fit score ${score} out of 100 — ${tone.label}`}
    >
      {/* soft halo behind ring */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full animate-halo-breathing"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${tone.glow}, transparent 75%)`
        }}
      />
      <svg
        width={preset.px}
        height={preset.px}
        viewBox={`0 0 ${preset.px} ${preset.px}`}
        className="relative -rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`fit-ring-${gradientId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={tone.stroke} stopOpacity={1} />
            <stop offset="100%" stopColor={tone.stroke} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={preset.px / 2}
          cy={preset.px / 2}
          r={r}
          stroke="rgba(148,163,184,0.18)"
          strokeWidth={preset.stroke}
          fill="none"
        />
        {/* progress */}
        {reduce ? (
          <circle
            cx={preset.px / 2}
            cy={preset.px / 2}
            r={r}
            stroke={`url(#fit-ring-${gradientId})`}
            strokeWidth={preset.stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={C}
            strokeDashoffset={dashoffsetReduced}
          />
        ) : (
          <motion.circle
            cx={preset.px / 2}
            cy={preset.px / 2}
            r={r}
            stroke={`url(#fit-ring-${gradientId})`}
            strokeWidth={preset.stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={C}
            style={{ strokeDashoffset: dashoffset }}
          />
        )}
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center font-semibold text-mist-50",
          preset.scoreFont
        )}
        aria-hidden
      >
        {Math.round(score)}
        {showLabel && (
          <span
            className={cn(
              "font-medium text-mist-400 mt-0.5 leading-none tracking-wider uppercase",
              preset.font
            )}
          >
            {tone.label}
          </span>
        )}
      </span>
    </div>
  );
}

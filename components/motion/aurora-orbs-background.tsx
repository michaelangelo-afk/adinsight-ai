"use client";

// AuroraOrbsBackground
//
// Replaces the old `bg-mesh-gradient-light`/`dark` mesh-shift background.
// Renders 4 large blurred gradient orbs that constantly drift via
// framer-motion. The whole thing is `pointer-events-none` and sits
// behind the page content.
//
// Why 4 orbs and not 8? Premiuim SaaS sites (Linear, Vercel, Stripe
// Sessions) keep the bg restrained — too many orbs feel like a 2010
// wallpaper. 4 gets us the "alive" feel without the circus.
//
// Three rotate-direction variants (`a`, `b`, `c`) so they don't move in
// lock-step. `reverse` on b means it moves the opposite of a.

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Variant = "light" | "dark";

export function AuroraOrbsBackground({
  variant = "light",
  intensity = 1,
  className
}: {
  variant?: Variant;
  /** 0–1. 1 is the default scene tightness; 0.5 for the auth side panel. */
  intensity?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  // Per-orb slow drift. We keep durations long (18-30s) so the brain
  // *registers* movement without consciously tracking it. Repeated
  // eased rows give a Lissajous-like wandering.
  const drift = (variant: "a" | "b" | "c") => ({
    animate: reduceMotion
      ? undefined
      : {
          x: ["0%", variant === "b" ? "-4%" : "4%", "0%"],
          y: ["0%", variant === "c" ? "3%" : "-3%", "0%"],
          scale: [1, 1.08, 0.96, 1]
        },
    transition: {
      duration: variant === "a" ? 22 : variant === "b" ? 28 : 34,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  });

  // Palette per mode. light = warm washed greens; dark = deep emerald glow.
  const tones = React.useMemo(() => {
    if (variant === "dark") {
      return {
        a: "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.55) 0%, rgba(16, 185, 129, 0.25) 35%, transparent 70%)",
        b: "radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.50) 0%, rgba(21, 128, 61, 0.20) 35%, transparent 70%)",
        c: "radial-gradient(circle at 50% 50%, rgba(110, 231, 183, 0.40) 0%, rgba(16, 185, 129, 0.15) 40%, transparent 75%)",
        d: "radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.35) 0%, transparent 65%)"
      };
    }
    return {
      a: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.45) 0%, rgba(34, 197, 94, 0.20) 35%, transparent 70%)",
      b: "radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.40) 0%, rgba(21, 128, 61, 0.18) 35%, transparent 70%)",
      c: "radial-gradient(circle at 50% 50%, rgba(110, 231, 183, 0.30) 0%, rgba(16, 185, 129, 0.10) 40%, transparent 75%)",
      d: "radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.25) 0%, transparent 65%)"
    };
  }, [variant]);

  return (
    <div
      aria-hidden
      className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className ?? ""}`}
    >
      {/* Stable base gradient so the very first paint (no JS) still
          looks like the brand, not white. */}
      <div
        className={
          variant === "dark"
            ? "absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(16,185,129,0.10),transparent_60%)]"
            : "absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(16,185,129,0.08),transparent_60%)]"
        }
      />
      {/* Orb A — bottom-right emerald, primary brand movement */}
      <motion.div
        className="glow-orb"
        style={{
          background: tones.a,
          width: `${520 * intensity}px`,
          height: `${520 * intensity}px`,
          right: "-8%",
          bottom: "-10%",
          willChange: "transform"
        }}
        {...drift("a")}
      />
      {/* Orb B — top-left forest green, opposite direction */}
      <motion.div
        className="glow-orb"
        style={{
          background: tones.b,
          width: `${460 * intensity}px`,
          height: `${460 * intensity}px`,
          left: "-6%",
          top: "-4%",
          willChange: "transform"
        }}
        {...drift("b")}
      />
      {/* Orb C — center-right mint accent, slower peripheral shimmer */}
      <motion.div
        className="glow-orb"
        style={{
          background: tones.c,
          width: `${320 * intensity}px`,
          height: `${320 * intensity}px`,
          right: "32%",
          top: "44%",
          opacity: 0.85,
          willChange: "transform"
        }}
        {...drift("c")}
      />
      {/* Orb D — small lime pop near the focal plane, fastest subtle pulse */}
      <motion.div
        className="glow-orb"
        style={{
          background: tones.d,
          width: `${220 * intensity}px`,
          height: `${220 * intensity}px`,
          left: "30%",
          bottom: "12%",
          opacity: 0.7,
          willChange: "transform"
        }}
        {...drift("a")}
      />

      {/* Film-grain noise overlay. mix-blend-mode: overlay makes it
          visible on both white AND ink-950 surfaces without disturbing
          color tokens. */}
      <div className="absolute inset-0 texture-grain" />
    </div>
  );
}

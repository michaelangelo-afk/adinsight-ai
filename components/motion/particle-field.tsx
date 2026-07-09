"use client";

// ParticleField
//
// A scattered field of small dots that drift lazily at varied speeds.
// Two purposes:
//   1. Add texture to large surfaces (hero, pricing featured tier, auth
//      side panel) so they don't feel "empty" next to motion-rich
//      components.
//   2. Reinforce depth — three weight tiers (xs / sm / md) give the
//      illusion of foreground/midground/background.
//
// Deterministic positions so SSR + first-paint hydration match exactly.
// No Math.random() at render — that would silently break hydration.

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ParticleVariant = "light" | "dark";

interface Particle {
  /** Left % (0–100) */
  x: number;
  /** Top % (0–100) */
  y: number;
  /** Pixel size */
  size: number;
  /** Base opacity 0–1 */
  opacity: number;
  /** Per-particle drift duration in s */
  duration: number;
  /** Negative delay for stagger so they don't all peak in unison */
  delay: number;
  /** Brightness tier used to weight drift amplitude */
  weight: "xs" | "sm" | "md";
}

/**
 * Tiny deterministic PRNG (Mulberry32). Stable across render cycles
 * for a given (seed, count). We use this so SSR HTML == first client
 * render and React doesn't warn about hydration.
 */
function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateParticles(count: number, seed = 1337): Particle[] {
  const rng = makeRng(seed);
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng();
    const weight: Particle["weight"] =
      r < 0.55 ? "xs" : r < 0.85 ? "sm" : "md";
    const size =
      weight === "xs"
        ? 1 + Math.round(rng() * 1) // 1-2px
        : weight === "sm"
        ? 2 + Math.round(rng() * 1) // 2-3px
        : 3 + Math.round(rng() * 2); // 3-5px
    out.push({
      x: rng() * 100,
      y: rng() * 100,
      size,
      opacity: 0.35 + rng() * 0.5,
      duration: 12 + Math.round(rng() * 18), // 12-30s
      delay: -Math.round(rng() * 12),
      weight
    });
  }
  return out;
}

export function ParticleField({
  count = 36,
  seed = 1337,
  variant = "light",
  className,
  /** When true, the field is absolutely positioned inside its parent.
   *  When false, it fills the nearest relative ancestor. */
  fill = true
}: {
  count?: number;
  seed?: number;
  variant?: ParticleVariant;
  className?: string;
  fill?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  // Generate particles once. Seed change regenerates. Cheap — runs
  // inside React render so it's deterministic per build.
  const particles = React.useMemo(
    () => generateParticles(count, seed),
    [count, seed]
  );

  // dot color per variant: emerald on light, mint-white on dark
  const dotColor =
    variant === "dark"
      ? "rgba(187, 247, 208, 0.95)" // mint-200-ish but bright
      : "rgba(21, 128, 61, 0.85)"; // forest green

  return (
    <div
      aria-hidden
      className={
        (fill ? "absolute inset-0 " : "") +
        "pointer-events-none overflow-hidden " +
        (className ?? "")
      }
    >
      {particles.map((p, i) => {
        // Amplitude of the orbit per weight tier (foreground drifts more).
        const amp =
          p.weight === "md" ? 14 : p.weight === "sm" ? 8 : 4;
        return (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "9999px",
              backgroundColor: dotColor,
              opacity: p.opacity,
              boxShadow:
                variant === "dark"
                  ? "0 0 6px 1px rgba(187, 247, 208, 0.55)"
                  : "0 0 4px 1px rgba(16, 185, 129, 0.35)",
              willChange: "transform"
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [-amp, amp, -amp],
                    y: [-amp / 3, amp / 3, -amp / 3],
                    opacity: [p.opacity * 0.6, p.opacity, p.opacity * 0.6]
                  }
            }
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay
            }}
          />
        );
      })}
    </div>
  );
}

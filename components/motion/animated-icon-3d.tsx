"use client";

// AnimatedIcon3D
//
// Adds life to a Lucide icon. Three layers of motion, all composing:
//
//  1. IDLE wobble — multi-axis micro-rotate + 1px translate every 3.6s.
//     The icon never sits still, but the motion is too small to read
//     consciously.
//  2. BREATHING halo — a soft glow that pulses around the icon,
//     reinforcing its importance. Color matches the parent theme
//     (emerald by default).
//  3. HOVER pop — on hover, the icon snaps to scale 1.12 + rotate 10°
//     with a slow ease, like a button being physically pressed.
//
// Plus an optional "orbiter" — a smaller icon that travels on an
// invisible elliptical motion path around the parent's bounding box.
// Used on the Hero preview to suggest the dashboard "scanning live".
//
// Reduced motion: every animation falls back to the static state.

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type MotionProps
} from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbiterSpec {
  /** JSX node (Lucide icon or any absolute-positioned element) */
  node: React.ReactNode;
  /** Container size in px. Required for the orbit ellipse to feel right. */
  radius?: number;
  /** Orbit duration in seconds */
  duration?: number;
  /** Per-orbit start phase (deg) */
  phase?: number;
  /** Scale on orbit (1 = same as parent) */
  scale?: number;
}

interface AnimatedIcon3DProps {
  /** Primary Lucide icon (or any absolute-positioned child) */
  icon: React.ReactNode;
  /** Container size in Tailwind classes (e.g. "h-12 w-12") */
  size?: string;
  /** Halo color theme — emerald by default */
  tone?: "emerald" | "violet" | "lime";
  /** Disable idle wobble but keep hover */
  staticIdle?: boolean;
  /** Orbiters floating around the parent */
  orbiters?: OrbiterSpec[];
  /** Extra container classes */
  className?: string;
  /** if true, the inner content scales with the halo. Useful when
   * wrapper size is set externally. */
  innerClassName?: string;
}

const TONE_RING: Record<NonNullable<AnimatedIcon3DProps["tone"]>, string> = {
  emerald:
    "shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_24px_-4px_rgba(16,185,129,0.45)]",
  violet:
    "shadow-[0_0_0_1px_rgba(124,58,237,0.25),0_0_24px_-4px_rgba(124,58,237,0.45)]",
  lime: "shadow-[0_0_0_1px_rgba(132,204,22,0.25),0_0_24px_-4px_rgba(132,204,22,0.45)]"
};

const TONE_HOVER: Record<NonNullable<AnimatedIcon3DProps["tone"]>, string> = {
  emerald:
    "shadow-[0_0_0_1px_rgba(16,185,129,0.55),0_0_30px_-2px_rgba(16,185,129,0.7)]",
  violet:
    "shadow-[0_0_0_1px_rgba(124,58,237,0.55),0_0_30px_-2px_rgba(124,58,237,0.7)]",
  lime: "shadow-[0_0_0_1px_rgba(132,204,22,0.55),0_0_30px_-2px_rgba(132,204,22,0.7)]"
};

export function AnimatedIcon3D({
  icon,
  size = "h-11 w-11",
  tone = "emerald",
  staticIdle = false,
  orbiters = [],
  className,
  innerClassName
}: AnimatedIcon3DProps) {
  const reduceMotion = useReducedMotion();

  // Idle wobble props (multi-axis micro-rotate + 1px translate).
  const idle: MotionProps = staticIdle
    ? {}
    : {
        animate: reduceMotion
          ? undefined
          : {
              rotate: [-1.5, 1.5, -1.5],
              y: [-0.5, 0.5, -0.5]
            },
        transition: {
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-xl",
        size,
        TONE_RING[tone],
        "bg-violet-700/15 dark:bg-violet-700/15",
        className
      )}
    >
      {/* Inner icon — wobbles idly + pops on parent hover. */}
      <motion.div
        className={cn("relative inline-flex items-center justify-center", innerClassName)}
        {...idle}
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.12,
                rotate: 10,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
              }
        }
        whileTap={
          reduceMotion
            ? undefined
            : {
                scale: 0.95,
                rotate: 0,
                transition: { duration: 0.18 }
              }
        }
      >
        {/* The icon itself. Kicks up a hover ring color when parent
            hovers via group hover utility. */}
        <span
          className={cn(
            "inline-flex items-center justify-center transition-shadow duration-300",
            "text-violet-700 dark:text-violet-300"
          )}
        >
          {icon}
        </span>
      </motion.div>
      {/* Breathing halo overlay. Sits BEHIND the icon (z:0, icon is z:1). */}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl transition-shadow duration-300",
          TONE_HOVER[tone]
        )}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.55, 1, 0.55],
                scale: [1, 1.04, 1]
              }
        }
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ zIndex: -1 }}
      />

      {/* Orbiters — small floating icons / glyphs that travel on a
          motion path around the parent's bounding box. Each one
          declarative via prop so callers control the visual. */}
      {orbiters.map((o, i) => {
        const r = o.radius ?? 36;
        const duration = o.duration ?? 9 + i * 1.4;
        const phase = o.phase ?? i * 90;
        const scale = o.scale ?? 0.55;
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute inline-flex items-center justify-center"
            style={{
              left: "50%",
              top: "50%",
              width: 0,
              height: 0,
              zIndex: 2
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [
                      Math.cos((phase * Math.PI) / 180) * r,
                      Math.cos(((phase + 360) * Math.PI) / 180) * r
                    ],
                    y: [
                      Math.sin((phase * Math.PI) / 180) * (r * 0.55),
                      Math.sin(((phase + 360) * Math.PI) / 180) * (r * 0.55)
                    ]
                  }
            }
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <span
              className="inline-flex items-center justify-center text-violet-600 dark:text-violet-300"
              style={{ transform: `scale(${scale})` }}
            >
              {o.node}
            </span>
          </motion.span>
        );
      })}
    </div>
  );
}

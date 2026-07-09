"use client";

// AnimatedLogo
//
// The brand leaf, with strokes that draw themselves on mount and
// orbiters floating around it. Used in the auth side panel + CTA.
//
// Why this exists:
//   - The static <Logo/> is good but it's a brand WRAPPER, not a hero.
//   - In an auth split-panel or a feature hero, we want the leaf to
//     do MORE than sit there.
//
// Behavior:
//   - The leaf outline draws itself (pathLength 0→1) on first paint.
//   - The midrib (white inner stem) draws after the outline.
//   - The "growth" chevrons draw last, in a staggered sequence.
//   - Once drawn, the whole leaf gently "breathes" via scale-pulse.
//
// Optional `orbiters` floats small icons (₦, %, ⚡) around the leaf on
// a Lissajous path.

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbiterGlyph {
  /** Either a string to render in a styled span, or a React node */
  content: React.ReactNode;
  /** Container size (px) for orbit */
  radiusX?: number;
  radiusY?: number;
  duration?: number;
  phase?: number;
}

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  orbiters?: OrbiterGlyph[];
  showWordmark?: boolean;
}

export function AnimatedLogo({
  size = 96,
  className,
  orbiters = [
    { content: "₦", duration: 8, phase: 0 },
    { content: "%", duration: 11, phase: 120 },
    { content: "▲", duration: 9.5, phase: 240 }
  ],
  showWordmark = false
}: AnimatedLogoProps) {
  const reduceMotion = useReducedMotion();

  // Shared transition tokens. Long, calm. Premium feel = slow.
  const drawTransition = {
    duration: 1.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Orbiters — sit outside the leaf, on a wider orbit. */}
      {orbiters.map((o, i) => {
        const rx = o.radiusX ?? (size * 0.85);
        const ry = o.radiusY ?? (size * 0.55);
        const phaseRad = ((o.phase ?? i * 120) * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 inline-flex items-center justify-center"
            style={{ width: 0, height: 0 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [
                      Math.cos(phaseRad) * rx,
                      Math.cos(phaseRad + Math.PI * 2) * rx
                    ],
                    y: [
                      Math.sin(phaseRad) * ry,
                      Math.sin(phaseRad + Math.PI * 2) * ry
                    ]
                  }
            }
            transition={{
              duration: o.duration ?? 8 + i * 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <span
              className="inline-flex items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/15 text-emerald-300 text-[10px] font-bold shadow-[0_0_12px_-2px_rgba(16,185,129,0.55)]"
              style={{
                width: size * 0.18,
                height: size * 0.18
              }}
            >
              {o.content}
            </span>
          </motion.span>
        );
      })}

      {/* The leaf itself. */}
      <motion.svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.04, 1]
              }
        }
        transition={{
          duration: 4.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <defs>
          <linearGradient id="logo-grad-premium" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="55%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="logo-fill-premium" x1="0" y1="36" x2="36" y2="0">
            <stop offset="0%" stopColor="#052E16" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Outer leaf stroke — pathLength 0→1 draws it. */}
        <motion.path
          d="M 18 4 C 27 8, 31 14, 31 22 C 31 28, 26 32, 18 32 C 10 32, 5 28, 5 22 C 5 14, 9 8, 18 4 Z"
          stroke="url(#logo-grad-premium)"
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="url(#logo-grad-premium)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...drawTransition, delay: 0 }}
        />
        <motion.path
          d="M 18 4 C 27 8, 31 14, 31 22 C 31 28, 26 32, 18 32 C 10 32, 5 28, 5 22 C 5 14, 9 8, 18 4 Z"
          fill="url(#logo-fill-premium)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.8, duration: 1 }}
        />
        {/* Midrib — vertical stem */}
        <motion.path
          d="M 18 9 L 18 30"
          stroke="#FFFFFF"
          strokeOpacity={0.6}
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...drawTransition, delay: 0.6 }}
        />
        {/* Chevron 1 — first growth tick */}
        <motion.path
          d="M 14 22 L 18 18 L 22 22"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...drawTransition, delay: 1.2 }}
        />
        {/* Chevron 2 — second growth tick */}
        <motion.path
          d="M 14 27 L 18 23 L 22 27"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...drawTransition, delay: 1.6 }}
        />
      </motion.svg>

      {showWordmark && (
        <span className="sr-only">GrowthAds</span>
      )}
    </div>
  );
}

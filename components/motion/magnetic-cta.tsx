"use client";

// MagneticCTA
//
// Wraps a CTA button so it pulls gently (max ~8px) toward the
// cursor when nearby. Drop-in replacement for <LinkButton/> on the
// hero primary CTA. Gives a satisfying "weight + direction" feel
// without overdoing it.
//
// Children MUST be a single anchor/button element with a defined
// size. Component reads child bounding rect and offsets relative
// to it. Center reset is on mouseleave.

import * as React from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PULL_STRENGTH = 0.18;
const MAX_PULL_PX = 8;

interface MagneticCTAProps {
  children: React.ReactElement;
  className?: string;
  /** Force-disable even if motion is OK (e.g. on touch / keyboard). */
  disabled?: boolean;
}

export function MagneticCTA({
  children,
  className,
  disabled
}: MagneticCTAProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || disabled) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    // Clamp so it never goes past MAX_PULL_PX in either axis.
    x.set(Math.max(-MAX_PULL_PX, Math.min(MAX_PULL_PX, relX * PULL_STRENGTH)));
    y.set(Math.max(-MAX_PULL_PX, Math.min(MAX_PULL_PX, relY * PULL_STRENGTH)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, display: "inline-block" }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

"use client";

// TextureGrain
//
// Stand-alone grain overlay. Same visual as the .texture-grain CSS
// utility, but exposed as a component so callers don't need to
// remember the class name. Also lets us dynamically toggle intensity.
//
// Use: render absolutely positioned inside a relative parent that
// already has the visual content (gradients, blobs). Pair with
// backdrop-filter or mix-blend-mode: overlay.

import { cn } from "@/lib/utils";

export function TextureGrain({
  intensity = 1,
  className
}: {
  /** 0–1 multiplier on the grain opacity */
  intensity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("texture-grain absolute inset-0", className)}
      style={{ opacity: 0.06 * intensity }}
    />
  );
}

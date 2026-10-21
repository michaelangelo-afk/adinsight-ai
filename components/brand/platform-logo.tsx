import type * as React from "react";
import { PLATFORM_LOGOS } from "@/lib/platforms/logos";
import { cn } from "@/lib/utils";

/**
 * Platform keys used by the dashboard's account/campaign models map to the
 * catalog id whose logo best represents them. Anything unknown returns null so
 * the caller can keep its neutral dot fallback instead of inventing a mark.
 */
const ALIASES: Record<string, string> = {
  google: "google-ads",
  facebook: "meta",
  "meta-ads": "meta"
};

export function PlatformLogo({
  platform,
  size = "sm",
  className,
  fallback = null
}: {
  platform: string;
  size?: "xs" | "sm" | "md";
  className?: string;
  /** Rendered when this platform has no downloaded logo yet. */
  fallback?: React.ReactNode;
}) {
  const src = PLATFORM_LOGOS[ALIASES[platform] ?? platform];
  if (!src) return <>{fallback}</>;

  const dim =
    size === "xs" ? "h-3.5 w-3.5" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      aria-hidden
      className={cn(dim, "shrink-0 object-contain", className)}
    />
  );
}

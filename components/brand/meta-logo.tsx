import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Meta brand mark + wordmark.
 *
 * The shape below is a representational rendering of Meta's published
 * infinity-style "M" (Meta corporate brand mark) using Meta Blue
 * #1877F2 → #0866FF gradient. For production, Meta's official SVG pack
 * is licensed at about.meta.com/brand/resources for registered Meta
 * developers — this component captures the same brand language in a
 * fully-inline SVG so we don't ship a redistributable asset and can
 * inherit dark-mode + size tokens from Tailwind without an extra
 * dependency.
 *
 * Use:
 *   <MetaLogo />                       — mark only (default sm size)
 *   <MetaLogo showWordmark />          — mark + lowercase "Meta"
 *   <MetaLogo size="md" />             — larger for hero placements
 *   <MetaLogo tone="mono" />           — currentColor mark for dark
 *                                         backgrounds
 */
type Tone = "brand" | "mono" | "invert";

export function MetaLogo({
  className,
  showWordmark = false,
  size = "sm",
  tone = "brand"
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "xs" | "sm" | "md";
  tone?: Tone;
}) {
  const dim =
    size === "xs" ? "h-3.5 w-3.5" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  // Each tone renders its own gradient so the mark stays legible on
  // the dashboard's glass-card backgrounds (dark ink-950 + violet hairlines).
  const gradId = `meta-mark-${tone}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0",
        className
      )}
    >
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(dim, "select-none")}
        aria-label="Meta"
        role={showWordmark ? "presentation" : "img"}
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {tone === "brand" && (
              <>
                <stop offset="0%" stopColor="#1877F2" />
                <stop offset="100%" stopColor="#0866FF" />
              </>
            )}
            {tone === "mono" && (
              <>
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E4E6EB" />
              </>
            )}
            {tone === "invert" && (
              <>
                <stop offset="0%" stopColor="#0A0F1F" />
                <stop offset="100%" stopColor="#0A0F1F" />
              </>
            )}
          </linearGradient>
        </defs>
        {/* Infinity-style "M" — two rounded humps joined at a clean
            central taper. Hand-tuned cubic curves to evoke Meta's
            published mark proportions without reproducing the
            proprietary SVG path data verbatim. */}
        <path
          fill={`url(#${gradId})`}
          d="M3,11 C3,7.5 6.7,5.4 9.8,7.4 C12.6,9.2 14.6,12.7 16,16 C17.4,12.7 19.4,9.2 22.2,7.4 C25.3,5.4 29,7.5 29,11 C29,15 26,21.5 22,25.7 C20.3,27.5 18.4,27.6 17.2,25.7 C16.4,24.4 16,22.4 16,21 C16,22.4 15.6,24.4 14.8,25.7 C13.6,27.6 11.7,27.5 10,25.7 C6,21.5 3,15 3,11 Z"
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight leading-none",
            size === "xs" ? "text-[11px]" : size === "sm" ? "text-[12px]" : "text-[14px]",
            tone === "brand" && "text-[#0866FF] dark:text-[#1877F2]",
            tone === "mono" && "text-white",
            tone === "invert" && "text-ink-950"
          )}
        >
          Meta
        </span>
      )}
    </span>
  );
}

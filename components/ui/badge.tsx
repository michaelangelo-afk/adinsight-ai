import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "accent" | "neutral" | "good" | "warn" | "bad";

/**
 * Status badge. Dark-first: a 10%-tinted fill, a 25%-tinted border and the
 * 300-step text colour for the tone, so it reads as a status light rather than
 * a button. Light-surface twins are kept for the marketing/auth surfaces.
 */
const tones: Record<Tone, string> = {
  brand: "bg-brand-500/[0.12] text-brand-300 border-brand-500/25",
  accent: "bg-brand-500/[0.12] text-brand-300 border-brand-500/25",
  neutral: "bg-white/[0.04] text-mist-300 border-white/[0.09]",
  good: "bg-brand-500/[0.12] text-brand-300 border-brand-500/25",
  warn: "bg-amber-500/[0.12] text-amber-300 border-amber-500/25",
  bad: "bg-rose-500/[0.12] text-rose-300 border-rose-500/25"
};

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  /** Render a 5px leading status dot in the current tone. */
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.06em]",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}

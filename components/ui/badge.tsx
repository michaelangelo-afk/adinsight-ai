import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "violet"
  | "naira"
  | "neutral"
  | "good"
  | "warn"
  | "bad";

const tones: Record<Tone, string> = {
  violet: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  naira: "bg-naira-600/15 text-naira-300 border border-naira-600/30",
  neutral: "bg-mist-50/[0.05] text-mist-200 hairline",
  good: "bg-naira-600/15 text-naira-300 border border-naira-600/30",
  warn: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  bad: "bg-rose-500/15 text-rose-300 border border-rose-500/30"
};

export function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

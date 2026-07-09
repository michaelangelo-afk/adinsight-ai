// components/billing/usage-meter.tsx
//
// Server-rendered usage bar with deterministic progress. Tone shifts
// at thresholds: green < 60%, amber 60-85%, rose 85%+.

import type { UsageMetric } from "@/lib/types";

function levelTone(pct: number): {
  ring: string;
  label: string;
  chip: "good" | "warn" | "bad";
} {
  if (pct < 60)
    return {
      ring: "from-emerald-500 to-emerald-300",
      label: "Plenty of room",
      chip: "good"
    };
  if (pct < 85)
    return {
      ring: "from-amber-500 to-amber-300",
      label: "Heads-up",
      chip: "warn"
    };
  return {
    ring: "from-rose-500 to-rose-300",
    label: "Near limit",
    chip: "bad"
  };
}

export function UsageMeter({ metric }: { metric: UsageMetric }) {
  const pct = Math.min(100, Math.round((metric.used / Math.max(1, metric.total)) * 100));
  const tone = levelTone(pct);

  return (
    <article
      className="glass-card rounded-2xl p-5 hover-lift animate-fade-up"
      aria-label={`${metric.label} usage`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-mist-500">
            {metric.label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-mist-50 tabular-nums animate-count-up">
              {metric.used.toLocaleString()}
            </span>
            <span className="text-xs text-mist-400 tabular-nums">
              / {metric.total.toLocaleString()}
            </span>
          </div>
          {metric.hint && (
            <div className="mt-0.5 text-[11px] text-mist-400">{metric.hint}</div>
          )}
        </div>
        <span
          className={
            "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border " +
            (tone.chip === "good"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : tone.chip === "warn"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
              : "bg-rose-500/15 border-rose-500/40 text-rose-200")
          }
        >
          {pct}% · {tone.label}
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-mist-50/[0.06] overflow-hidden">
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone.ring} animate-shimmer-stripes`}
          style={{
            width: `${pct}%`,
            backgroundSize: "200% 100%"
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-mist-500">
        <span>{metric.unit}</span>
        <span>{metric.total - metric.used} remaining</span>
      </div>
    </article>
  );
}

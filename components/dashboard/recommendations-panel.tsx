"use client";

import { useState } from "react";
import { Sparkles, Check, X, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recommendations } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";

type Filter = "all" | "pending" | "applied" | "dismissed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "applied", label: "Applied" },
  { id: "dismissed", label: "Dismissed" }
];

function impactTone(
  impact: "high" | "medium" | "low"
): "good" | "warn" | "neutral" {
  if (impact === "high") return "good";
  if (impact === "medium") return "warn";
  return "neutral";
}

export function RecommendationsPanel() {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.status === filter);

  const totalSavings = recommendations
    .filter((r) => r.status === "pending" && r.estimatedSavings)
    .reduce((s, r) => s + (r.estimatedSavings ?? 0), 0);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-violet-300">
            <Sparkles size={12} />
            AI Recommendations
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            {formatNaira(totalSavings)} on the table.
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Tap &ldquo;Apply&rdquo; to jump straight to Ads Manager with the change queued.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={
              "rounded-full px-3 py-1 text-xs font-medium transition-colors " +
              (filter === f.id
                ? "bg-violet-500/20 border border-violet-500/40 text-violet-200"
                : "bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-ink-900/60 hairline p-4 group hover:border-violet-500/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-500/30">
                <Sparkles size={14} className="text-violet-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-mist-50 leading-snug">
                    {r.title}
                  </h4>
                  <Badge tone={impactTone(r.impact)}>
                    {r.impact} impact
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs text-mist-300 leading-relaxed">
                  {r.body}
                </p>
                {r.estimatedSavings && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs">
                    <span className="text-mist-400">Estimated value:</span>
                    <span className="text-naira-400 font-semibold tabular-nums">
                      {formatNaira(r.estimatedSavings)}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled
                        aria-label="Apply"
                        title={`Demo action — would apply: ${r.title}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-violet-600/70 px-3 py-1.5 text-xs font-medium text-white cursor-not-allowed"
                      >
                        <ArrowUpRight size={12} />
                        Apply
                      </button>
                      <button
                        type="button"
                        disabled
                        aria-label="Mark done"
                        title="Demo action — would mark recommendation as done"
                        className="inline-flex items-center gap-1.5 rounded-md bg-mist-50/[0.02] hairline px-3 py-1.5 text-xs font-medium text-mist-400 cursor-not-allowed"
                      >
                        <Check size={12} />
                        Mark done
                      </button>
                      <button
                        type="button"
                        disabled
                        aria-label="Dismiss"
                        title="Demo action — would dismiss recommendation"
                        className="inline-flex items-center gap-1.5 rounded-md bg-mist-50/[0.02] hairline px-3 py-1.5 text-xs font-medium text-mist-400 cursor-not-allowed"
                      >
                        <X size={12} />
                        Dismiss
                      </button>
                    </>
                  )}
                  {r.status === "applied" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-naira-500/15 border border-naira-500/30 px-3 py-1.5 text-xs font-medium text-naira-300">
                      <Check size={12} />
                      Applied — performance tracking
                    </span>
                  )}
                  {r.status === "dismissed" && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-mist-50/[0.04] hairline px-3 py-1.5 text-xs font-medium text-mist-400">
                      <X size={12} />
                      Dismissed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-mist-400 py-10">
            No recommendations in this view.
          </div>
        )}
      </div>
    </div>
  );
}

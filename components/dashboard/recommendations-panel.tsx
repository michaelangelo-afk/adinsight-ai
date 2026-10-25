"use client";

import * as React from "react";
import {
  Sparkles,
  Check,
  X,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MetricTooltip } from "@/components/ui/tooltip";
import type { Recommendation } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { updateRecommendationStatus } from "@/app/actions/recommendations";
import { SavingsOnTableTip, ImpactTip } from "@/lib/metric-tooltips";
import { Panel, PanelHeader } from "@/components/ui/panel";

type Filter = "all" | "pending" | "applied";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Open" },
  { id: "applied", label: "Applied" }
];

function impactTone(
  impact: "high" | "medium" | "low"
): "good" | "warn" | "neutral" {
  if (impact === "high") return "good";
  if (impact === "medium") return "warn";
  return "neutral";
}

export function RecommendationsPanel({
  recommendations
}: {
  recommendations: Recommendation[];
}) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.status === filter);

  // Three fits the chart's height exactly; the rest live on /recommendations.
  // A scrolling list inside a fixed panel cut cards in half at the fold.
  const visible = filtered.slice(0, 3);

  const pending = recommendations.filter((r) => r.status === "pending");
  const applied = recommendations.filter((r) => r.status === "applied");
  const totalSavings = pending.reduce(
    (s, r) => s + (r.estimatedSavings ?? 0),
    0
  );
  const coverage = recommendations.length
    ? Math.round((applied.length / recommendations.length) * 100)
    : 0;

  return (
    <Panel className="flex flex-col p-5">
      <PanelHeader
        eyebrow={
          <>
            <Sparkles size={12} aria-hidden className="text-brand-300" />
            AI executive readout
          </>
        }
        title={
          <MetricTooltip
            content={SavingsOnTableTip}
            label="What ₦ on the table means"
            side="bottom"
          >
            <span>{formatNaira(totalSavings)} on the table.</span>
          </MetricTooltip>
        }
        description={`${pending.length} open recommendation${
          pending.length === 1 ? "" : "s"
        }, ranked by expected impact.`}
        actions={
          <div className="seg" role="group" aria-label="Filter recommendations">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                data-active={filter === f.id}
                className="seg-item"
                aria-pressed={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-4 flex-1 space-y-2">
        {visible.map((r) => (
          <div
            key={r.id}
            className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors duration-200 hover:border-white/[0.12]"
          >
            <div className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/[0.12] text-brand-300"
                aria-hidden
              >
                {r.status === "applied" ? (
                  <ShieldCheck size={13} />
                ) : (
                  <Sparkles size={13} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[12.5px] font-medium leading-snug text-mist-50">
                    {r.title}
                  </h4>
                  <MetricTooltip
                    content={ImpactTip}
                    label="What impact level means"
                    side="bottom"
                  >
                    <span>
                      <Badge tone={impactTone(r.impact)}>
                        {r.impact}
                      </Badge>
                    </span>
                  </MetricTooltip>
                </div>

                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-mist-400">
                  {r.body}
                </p>

                {r.estimatedSavings ? (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px]">
                    <TrendingUp size={10} aria-hidden className="text-brand-400" />
                    <span className="text-mist-500">Estimated value</span>
                    <span className="font-semibold tabular-nums text-brand-300">
                      {formatNaira(r.estimatedSavings)}
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {r.status === "pending" && (
                    <>
                      <form
                        action={updateRecommendationStatus.bind(
                          null,
                          r.id,
                          "applied"
                        )}
                      >
                        <button
                          type="submit"
                          aria-label={`Apply: ${r.title}`}
                          className="inline-flex h-6 items-center gap-1 rounded-md bg-brand-600 px-2 text-[10.5px] font-semibold text-white transition-colors hover:bg-brand-500"
                        >
                          <ArrowUpRight size={10} aria-hidden />
                          Apply
                        </button>
                      </form>
                      <form
                        action={updateRecommendationStatus.bind(
                          null,
                          r.id,
                          "applied"
                        )}
                      >
                        <button
                          type="submit"
                          aria-label={`Mark done: ${r.title}`}
                          className="inline-flex h-6 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[10.5px] font-medium text-mist-300 transition-colors hover:border-brand-500/40 hover:text-brand-200"
                        >
                          <Check size={10} aria-hidden />
                          Done
                        </button>
                      </form>
                      <form
                        action={updateRecommendationStatus.bind(
                          null,
                          r.id,
                          "dismissed"
                        )}
                      >
                        <button
                          type="submit"
                          aria-label={`Dismiss: ${r.title}`}
                          className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[10.5px] font-medium text-mist-500 transition-colors hover:text-rose-300"
                        >
                          <X size={10} aria-hidden />
                          Dismiss
                        </button>
                      </form>
                    </>
                  )}
                  {r.status === "applied" && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-brand-300">
                      <Check size={10} aria-hidden />
                      Applied — performance tracking
                    </span>
                  )}
                  {r.status === "dismissed" && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-mist-500">
                      <X size={10} aria-hidden />
                      Dismissed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/[0.08] py-10 text-center text-[12px] text-mist-500">
            Nothing in this view.
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-mist-400">Actions taken this period</span>
          <span className="inline-flex items-center gap-3">
            <span className="font-medium tabular-nums text-mist-100">
              {applied.length}/{recommendations.length} · {coverage}%
            </span>
            <Link
              href="/recommendations"
              className="font-medium text-mist-300 transition-colors hover:text-brand-300"
            >
              View all
            </Link>
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
            style={{ width: `${coverage}%` }}
            role="progressbar"
            aria-valuenow={coverage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Share of recommendations applied"
          />
        </div>
      </div>
    </Panel>
  );
}

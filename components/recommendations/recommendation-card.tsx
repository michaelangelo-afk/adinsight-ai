// components/recommendations/recommendation-card.tsx
//
// Server-rendered recommendation row. Two variants:
//  - "standard"  : compact row for the bento grid.
//  - "featured" : spans 2-cols on lg+; bigger, with the campaign
//                 it's anchored to + the AI-confidence bar.

import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Check,
  X,
  ArrowUpRight,
  ZapOff
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ImpactLevel, Recommendation, RecommendationStatus } from "@/lib/types";

const IMPACT_TONE: Record<
  ImpactLevel,
  { ring: string; chip: string; glow: string; label: string }
> = {
  high: {
    ring: "from-emerald-500 to-emerald-300",
    chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    glow: "rgba(16,185,129,0.40)",
    label: "High impact"
  },
  medium: {
    ring: "from-violet-500 to-violet-300",
    chip: "border-violet-500/40 bg-violet-500/15 text-violet-200",
    glow: "rgba(167,139,250,0.35)",
    label: "Medium impact"
  },
  low: {
    ring: "from-slate-400 to-slate-300",
    chip: "border-slate-500/40 bg-slate-500/15 text-slate-300",
    glow: "rgba(148,163,184,0.30)",
    label: "Low impact"
  }
};

const STATUS_META: Record<
  RecommendationStatus,
  { label: string; tone: "good" | "warn" | "bad" | "neutral" }
> = {
  pending: { label: "Pending review", tone: "warn" },
  applied: { label: "Applied", tone: "good" },
  dismissed: { label: "Dismissed", tone: "bad" }
};

function ImpactDot({ impact }: { impact: ImpactLevel }) {
  const tone = IMPACT_TONE[impact];
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full blur-md opacity-70"
        style={{ background: tone.glow }}
      />
      <span
        className={`relative h-2 w-2 rounded-full bg-gradient-to-br ${tone.ring}`}
      />
    </span>
  );
}

function StatusPill({ status }: { status: RecommendationStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone}>
      {status === "pending" && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-soft mr-1" />
      )}
      {status === "applied" && (
        <Check size={10} className="mr-1" aria-hidden />
      )}
      {status === "dismissed" && (
        <X size={10} className="mr-1" aria-hidden />
      )}
      {meta.label}
    </Badge>
  );
}

interface CommonProps {
  recommendation: Recommendation;
  campaignName?: string;
  href?: string;
}

interface StandardProps extends CommonProps {
  variant?: "standard";
  delay?: number;
}

interface FeaturedProps extends CommonProps {
  variant: "featured";
  delay?: number;
}

export type RecommendationCardProps = StandardProps | FeaturedProps;

export function RecommendationCard(props: RecommendationCardProps) {
  const { recommendation, campaignName, delay = 0 } = props;
  const isFeatured = props.variant === "featured";
  const href = props.href ?? `/recommendations?r=${recommendation.id}`;
  const tone = IMPACT_TONE[recommendation.impact];

  return (
    <Link
      href={href}
      aria-label={`View recommendation: ${recommendation.title}`}
      className="group glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up relative overflow-hidden tap-press block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(60% 60% at 30% 0%, ${tone.glow}, transparent 60%)`
        }}
      />
      <div
        className={
          "relative gap-4 " + (isFeatured ? "grid lg:grid-cols-[1fr,auto]" : "flex flex-col")
        }
      >
        <div className="min-w-0 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <ImpactDot impact={recommendation.impact} />
            <span className="text-[10px] uppercase tracking-wider text-mist-500">
              {tone.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-mist-600" aria-hidden>
              ·
            </span>
            <StatusPill status={recommendation.status} />
            {campaignName && (
              <span className="text-[10px] uppercase tracking-wider text-violet-300">
                {campaignName}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-mist-50 leading-snug">
            {recommendation.title}
          </h3>
          {isFeatured && (
            <p className="text-sm text-mist-300 leading-relaxed line-clamp-3">
              {recommendation.body}
            </p>
          )}
          {!isFeatured && (
            <p className="text-xs text-mist-400 leading-relaxed line-clamp-2">
              {recommendation.body}
            </p>
          )}

          {recommendation.estimatedSavings && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <TrendingUp
                size={11}
                aria-hidden
                className="text-emerald-300"
              />
              <span className="text-mist-400">Projected value:</span>
              <span className="text-emerald-300 font-semibold tabular-nums">
                {formatNaira(recommendation.estimatedSavings)}
              </span>
            </div>
          )}
        </div>

        <div
          className={
            "flex items-center gap-3 " +
            (isFeatured ? "" : "mt-2 justify-between")
          }
        >
          {isFeatured ? (
            <>
              <div className="hidden lg:block">
                <div className="text-[10px] uppercase tracking-wider text-mist-500">
                  AI confidence
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-mist-50 tabular-nums">
                    {recommendation.impact === "high" ? "92" : recommendation.impact === "medium" ? "78" : "61"}
                    %
                  </span>
                  <span className="relative inline-block h-1.5 w-12 rounded-full bg-mist-50/[0.06] overflow-hidden">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                      style={{
                        width:
                          recommendation.impact === "high"
                            ? "92%"
                            : recommendation.impact === "medium"
                            ? "78%"
                            : "61%"
                      }}
                    />
                  </span>
                </div>
              </div>
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mist-50/[0.04] hairline text-mist-300 transition-all duration-300 group-hover:text-violet-200 group-hover:bg-violet-500/15 group-hover:border-violet-500/40 group-hover:translate-x-0.5"
              >
                <ArrowUpRight size={15} aria-hidden />
              </span>
            </>
          ) : (
            <>
              {recommendation.estimatedSavings ? (
                <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold tabular-nums">
                  {formatNaira(recommendation.estimatedSavings)}
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-wider text-mist-500">
                  No savings estimate
                </span>
              )}
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-mist-50/[0.04] hairline text-mist-400 transition-all duration-300 group-hover:text-violet-200 group-hover:bg-violet-500/15 group-hover:border-violet-500/40 group-hover:translate-x-0.5"
              >
                <ArrowUpRight size={12} aria-hidden />
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Exports so other components can branch on impact/status without re-importing types. */
export function recommendationImpactTone(impact: ImpactLevel) {
  return IMPACT_TONE[impact];
}

/** Convenience pill for empty/dismissed ai states. */
export function PausedPill() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-mist-500">
      <ZapOff size={10} aria-hidden />
      no impact
    </span>
  );
}

/** Live spark showing AI model activity — decorative for the hero of the page. */
export function AiActivityPulse() {
  return (
    <span className="relative inline-flex" aria-label="AI engine live">
      <span className="absolute inset-0 rounded-full animate-ping h-2 w-2 bg-emerald-400 opacity-50" />
      <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
      <Sparkles size={10} className="ml-1 text-emerald-300" aria-hidden />
    </span>
  );
}

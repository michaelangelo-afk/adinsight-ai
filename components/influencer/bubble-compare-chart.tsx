// components/influencer/bubble-compare-chart.tsx
//
// "use client" — Recharts ScatterChart comparing each creator's
//     cost-per-1000-followers (CPM proxy) against the brand's
//     baseline ad cost-per-1000-reach.
//
// Color = quality quadrant. Size = projected reach. The dashed
// reference line is the brand's current ad-baseline — bubbles above
// the line cost more per reach than the brand's ads.

"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Cell
} from "recharts";
import { formatNaira, formatPercent } from "@/lib/utils";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import type { FitBreakdown } from "@/lib/influencer/types";
import { creatorQuadrant } from "@/lib/influencer/fit-score";
import { averageAdCpmBy1000Reach } from "@/lib/influencer/compare-to-ads";
import type { CampaignSummary } from "@/lib/types";
import { Sparkles, ArrowDownRight, ArrowUpRight } from "lucide-react";

const QUADRANT_COLOR: Record<string, string> = {
  "sweet-spot": "#10B981", // emerald-500
  "premium-overperform": "#A78BFA", // violet-400
  "budget-gem": "#34D399", // emerald-400
  "premium-underperform": "#F59E0B", // amber-500
  "low-priority": "#64748B" // slate-500
};

interface Datum {
  creator: ExtendedInfluencer;
  fit: FitBreakdown;
  x: number; // cpm-by-1k-followers
  y: number; // avg ER * 100
  z: number; // projected reach bubble size
  quadrant: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Datum }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      role="tooltip"
      className="rounded-xl p-3 text-xs shadow-lg"
      style={{
        background: "rgba(13,13,30,0.96)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div className="text-mist-50 font-semibold">{d.creator.fullName}</div>
      <div className="text-mist-400 mb-1.5">{d.creator.handle}</div>
      <div className="text-mist-300 tabular-nums">
        ₦{Math.round(d.x)}/1k followers · {formatPercent(d.creator.engagementRate, 2)} ER
      </div>
      <div className="text-mist-400 mt-1">Fit {d.fit.overall}/100</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-wider" style={{ color: QUADRANT_COLOR[d.quadrant] }}>
        {d.quadrant.replace("-", " ")}
      </div>
    </div>
  );
}

export function BubbleCompareChart({
  creators,
  fits,
  campaigns
}: {
  creators: ExtendedInfluencer[];
  fits: Record<string, FitBreakdown>;
  campaigns: CampaignSummary[];
}) {
  const baselineCpm = averageAdCpmBy1000Reach(campaigns);

  const data: Datum[] = useMemo(() => {
    return creators.map((creator) => {
      const fit = fits[creator.id] ?? { overall: 0, byAxis: { audience: 0, niche: 0, budget: 0, geo: 0, cadence: 0 } };
      return {
        creator,
        fit,
        x: creator.cpmByFollower,
        y: creator.engagementRate * 100,
        z: Math.sqrt(creator.followerCount) / 50,
        quadrant: creatorQuadrant(creator, fit)
      };
    });
  }, [creators, fits]);

  return (
    <div
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-mist-600 dark:text-mist-400 inline-flex items-center gap-1.5">
            <Sparkles size={11} aria-hidden className="text-violet-300" />
            Compare to your ads
          </div>
          <h3 className="mt-1 text-lg font-semibold text-mist-50">
            Where creators win (and lose) vs your Meta Retargeting
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Bubbles = creators. <strong className="text-mist-50">Y axis</strong>:
            engagement rate. <strong className="text-mist-50">X axis</strong>:
            cost per 1,000 followers. <strong className="text-mist-50">Size</strong>:
            projected reach.{" "}
            <strong className="text-mist-50">Dashed line</strong>:{" "}
            <span className="text-emerald-300 tabular-nums">
              {formatNaira(baselineCpm)}
            </span>
            /1k reach on your existing Meta campaign.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1.5 text-[11px] text-mist-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sweet spot
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Premium overperform
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Budget gem
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Premium underperform
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Low priority
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 12, left: 4, bottom: 8 }}>
            <defs>
              <linearGradient id="bubble-vert" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.10)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="x"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickFormatter={(v) => `₦${Math.round(v / 1000)}k`}
            >
              <text
                x={50}
                y={285}
                textAnchor="middle"
                fill="#7a7ca0"
                fontSize={10}
              >
                ₦ per 1,000 followers →
              </text>
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
            >
              <text
                x={-10}
                y={10}
                textAnchor="middle"
                fill="#7a7ca0"
                fontSize={10}
                transform="rotate(-90)"
              >
                Engagement rate (%)
              </text>
            </YAxis>
            <ZAxis type="number" dataKey="z" range={[120, 900]} />
            <ReferenceArea
              x1={0}
              x2={1000}
              y1={5.5}
              y2={11}
              fill="rgba(16,185,129,0.06)"
              stroke="none"
            />
            <ReferenceLine
              x={baselineCpm}
              stroke="#10B981"
              strokeDasharray="4 4"
              label={{
                value: `Meta baseline ₦${Math.round(baselineCpm)}/1k reach`,
                fill: "#10B981",
                fontSize: 10,
                position: "top"
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={QUADRANT_COLOR[d.quadrant] ?? "#64748B"}
                  fillOpacity={0.85}
                  stroke={QUADRANT_COLOR[d.quadrant] ?? "#64748B"}
                  strokeWidth={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <Insight
          tone="naira"
          icon={<ArrowDownRight size={11} aria-hidden />}
          text={
            <>
              <strong className="text-mist-50">
                {data.filter((d) => d.x < baselineCpm * 0.6).length}
              </strong>{" "}
              creators cost{" "}
              <span className="text-emerald-300 font-medium">less</span> per
              reach than Meta — shortlist first.
            </>
          }
        />
        <Insight
          tone="violet"
          icon={<ArrowUpRight size={11} aria-hidden />}
          text={
            <>
              <strong className="text-mist-50">
                {data.filter((d) => d.quadrant === "sweet-spot").length}
              </strong>{" "}
              sweet-spot matches (high ER × affordable × high fit).
            </>
          }
        />
        <Insight
          tone="amber"
          icon={<Sparkles size={11} aria-hidden />}
          text={
            <>
              Avg fit{" "}
              <strong className="text-mist-50">
                {Math.round(
                  data.reduce((s, d) => s + d.fit.overall, 0) / Math.max(1, data.length)
                )}
              </strong>
              /100 across this cohort.
            </>
          }
        />
      </div>
    </div>
  );
}

function Insight({
  tone,
  icon,
  text
}: {
  tone: "violet" | "naira" | "amber";
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  const cls =
    tone === "naira"
      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
      : tone === "violet"
      ? "border-violet-500/30 bg-violet-500/[0.06]"
      : "border-amber-500/30 bg-amber-500/[0.08]";
  return (
    <div className={`rounded-lg border ${cls} px-3 py-2 flex items-start gap-2 text-mist-200`}>
      <span
        className={
          tone === "naira"
            ? "text-emerald-300 mt-0.5"
            : tone === "violet"
            ? "text-violet-300 mt-0.5"
            : "text-amber-300 mt-0.5"
        }
      >
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

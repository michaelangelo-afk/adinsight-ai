// components/recommendations/recommendations-timeline.tsx
//
// "use client" — Recharts stacked bar chart of weekly savings:
//   - "realized" = applied recommendations that converted to actual savings
//   - "opportunity" = pending recommendations (potential if applied)
//
// Pure deterministic mock data. Animated entrance.

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { formatNaira, formatCompactNumber } from "@/lib/utils";

const WEEKS = [
  { week: "W21", realized: 0, opportunity: 32_000, applied: 0 },
  { week: "W22", realized: 14_500, opportunity: 41_000, applied: 1 },
  { week: "W23", realized: 28_500, opportunity: 32_000, applied: 1 },
  { week: "W24", realized: 32_000, opportunity: 78_000, applied: 2 },
  { week: "W25", realized: 56_200, opportunity: 41_000, applied: 2 },
  { week: "W26", realized: 67_200, opportunity: 24_000, applied: 3 }
];

function CustomTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload: typeof WEEKS[number] }>;
}) {
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
      <div className="text-mist-50 font-semibold mb-1.5">{d.week}</div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-mist-300">Realized</span>
        <span className="text-mist-50 font-semibold tabular-nums ml-auto">
          {formatNaira(d.realized)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        <span className="text-mist-300">Opportunity</span>
        <span className="text-mist-50 font-semibold tabular-nums ml-auto">
          {formatNaira(d.opportunity)}
        </span>
      </div>
      <div className="text-[10px] text-mist-500 mt-1.5">
        {d.applied} recommendation{d.applied === 1 ? "" : "s"} applied
      </div>
    </div>
  );
}

export function RecommendationsTimeline() {
  const totalRealized = WEEKS.reduce((s, w) => s + w.realized, 0);
  const totalOpportunity = WEEKS.reduce((s, w) => s + w.opportunity, 0);

  return (
    <div
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-violet-300 inline-flex items-center gap-1.5">
            Savings timeline · 6 weeks
          </div>
          <h3 className="mt-1 text-lg font-semibold text-mist-50">
            Where your AI insights have paid off
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Realized savings vs open opportunity.{" "}
            <strong className="text-mist-50">
              ₦{formatCompactNumber(totalRealized)}
            </strong>{" "}
            captured this cycle —{" "}
            <strong className="text-emerald-300">
              ₦{formatCompactNumber(totalOpportunity)}
            </strong>{" "}
            still on the table.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-mist-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Realized
          </span>
          <span className="inline-flex items-center gap-1.5 text-mist-300">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Opportunity
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKS} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
            <defs>
              <linearGradient id="realized-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="opportunity-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <YAxis
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₦${Math.round(v / 1000)}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(124,58,237,0.08)" }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="realized"
              stackId="a"
              fill="url(#realized-grad)"
              radius={[0, 0, 0, 0]}
              animationBegin={150}
              animationDuration={700}
            />
            <Bar
              dataKey="opportunity"
              stackId="a"
              fill="url(#opportunity-grad)"
              radius={[6, 6, 0, 0]}
              animationBegin={300}
              animationDuration={700}
            >
              {WEEKS.map((w, i) => (
                <Cell
                  key={`opp-${i}`}
                  fillOpacity={w.opportunity === 0 ? 0 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
        <Insight
          tone="naira"
          text={
            <>
              Up <strong className="text-mist-50">3.4×</strong>{" "}
              recommended savings in 6 weeks — direct attribution to AI
              kills on Lagos + Abuja budgets.
            </>
          }
        />
        <Insight
          tone="violet"
          text={
            <>
              <strong className="text-mist-50">₦{formatCompactNumber(totalOpportunity)}</strong>{" "}
              still on the table — top apply: budget reallocation (CPC
              diff 40%).
            </>
          }
        />
        <Insight
          tone="amber"
          text={
            <>
              Avg AI confidence applied this cycle:{" "}
              <strong className="text-mist-50">86%</strong>
            </>
          }
        />
      </div>
    </div>
  );
}

function Insight({
  tone,
  text
}: {
  tone: "violet" | "naira" | "amber";
  text: React.ReactNode;
}) {
  const cls =
    tone === "naira"
      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
      : tone === "violet"
      ? "border-violet-500/30 bg-violet-500/[0.06]"
      : "border-amber-500/30 bg-amber-500/[0.08]";
  return (
    <div className={`rounded-lg border ${cls} px-3 py-2 text-mist-200`}>
      {text}
    </div>
  );
}

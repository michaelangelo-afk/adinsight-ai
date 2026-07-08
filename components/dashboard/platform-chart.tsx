"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import type { DashboardSummary } from "@/lib/types";
import { formatNaira, formatPercent } from "@/lib/utils";

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  meta: { name: "Meta", color: "#9b6cff" },
  google: { name: "Google", color: "#1ed68f" },
  tiktok: { name: "TikTok", color: "#5ee5ad" }
};

export function PlatformChart({ data }: { data: DashboardSummary["platformBreakdown"] }) {
  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const sorted = [...data].sort((a, b) => b.spend - a.spend);
  const chartData = sorted.map((d) => ({
    platform: PLATFORM_META[d.platform]?.name ?? d.platform,
    spend: d.spend,
    conversions: d.conversions,
    share: d.spend / totalSpend,
    orig: d.platform,
    color: PLATFORM_META[d.platform]?.color ?? "#9b6cff"
  }));

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-mist-400">
          Platform mix
        </div>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
          Where every naira goes
        </h3>
        <p className="mt-1 text-sm text-mist-300">
          Total: <span className="text-mist-50 font-medium">{formatNaira(totalSpend)}</span>
        </p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₦${Math.round(v / 1000)}k`}
            />
            <YAxis
              type="category"
              dataKey="platform"
              stroke="#7a7ca0"
              tick={{ fill: "#cdcee0", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "rgba(124,58,237,0.08)" }}
              contentStyle={{
                background: "rgba(13,13,30,0.95)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                color: "#f4f4ff",
                fontSize: 12
              }}
              formatter={(value, _key, item) => {
                const v = typeof value === "number" ? value : Number(value) || 0;
                const pay = item && typeof item === "object" && "payload" in item
                  ? (item as { payload?: { share?: number } }).payload
                  : undefined;
                const share = pay?.share ?? 0;
                return [`${formatNaira(v)} · ${formatPercent(share, 1)}`, "Spend"];
              }}
            />
            <Bar dataKey="spend" radius={[0, 8, 8, 0]} barSize={18}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion rate per platform */}
      <div className="mt-4 pt-4 border-t border-mist-50/[0.04] space-y-3">
        {chartData.map((p) => (
          <div key={p.platform} className="flex items-center gap-3">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-sm text-mist-200 flex-1">{p.platform}</span>
            <span className="text-sm text-mist-50 font-medium tabular-nums">
              {p.conversions} conv
            </span>
            <span className="text-xs text-mist-400 tabular-nums w-12 text-right">
              {formatPercent(p.share, 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-violet-500/[0.06] border border-violet-500/20 p-3 text-xs text-mist-200">
        <strong className="text-violet-300">
          Best cost-per-conversion:
        </strong>{" "}
        Meta Retargeting — ₦362/c. Lean into it.
      </div>
    </div>
  );
}

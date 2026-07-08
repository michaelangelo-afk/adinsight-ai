"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import type { DashboardSummary } from "@/lib/types";
import { formatCompactNumber, formatNaira } from "@/lib/utils";

export function TrendChart({ data }: { data: DashboardSummary["trend"] }) {
  // Format date for x-axis
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short"
    })
  }));

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-mist-400">
            Spend vs. conversions · 30 days
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            You spent less and got more.
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Daily trajectory across all connected platforms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-violet-500/10 text-violet-300 border border-violet-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Spend
          </span>
          <span className="chip bg-naira-500/10 text-naira-300 border border-naira-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-naira-400" />
            Conversions
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b6cff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#9b6cff" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="conv-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#1ed68f" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1ed68f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              interval={4}
            />
            <YAxis
              yAxisId="left"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#7a7ca0"
              tick={{ fill: "#7a7ca0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(13,13,30,0.95)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                color: "#f4f4ff",
                fontSize: 12
              }}
              formatter={(value, key) => {
                const num = typeof value === "number" ? value : Number(value) || 0;
                return key === "spend"
                  ? [formatNaira(num), "Spend"]
                  : [String(num), "Conversions"];
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="spend"
              stroke="#9b6cff"
              strokeWidth={2}
              fill="url(#spend-fill)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke="#1ed68f"
              strokeWidth={2}
              fill="url(#conv-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

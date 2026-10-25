"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import type { DashboardSummary } from "@/lib/types";
import { formatCompactNumber, formatNaira } from "@/lib/utils";
import { MetricTooltip } from "@/components/ui/tooltip";
import { SpendLegendTip, ConversionsLegendTip } from "@/lib/metric-tooltips";
import {
  SERIES,
  AXIS_TICK,
  GRID,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE
} from "@/lib/chart-theme";
import { Panel, PanelHeader } from "@/components/ui/panel";

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

function percent(a: number, b: number): number {
  if (!a) return 0;
  return ((b - a) / a) * 100;
}

export function TrendChart({ data }: { data: DashboardSummary["trend"] }) {
  const [range, setRange] = React.useState<Range>(30);

  const visible = data.slice(-range);
  const formatted = visible.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short"
    })
  }));

  // Compare the visible window against the immediately preceding window of the
  // same length so the header figures stay honest as the range changes.
  const previous = data.slice(
    Math.max(0, data.length - range * 2),
    Math.max(0, data.length - range)
  );
  const sum = (rows: typeof data, key: "spend" | "conversions") =>
    rows.reduce((s, r) => s + r[key], 0);
  const spendNow = sum(visible, "spend");
  const spendBefore = sum(previous, "spend");
  const convNow = sum(visible, "conversions");
  const convBefore = sum(previous, "conversions");
  const spendChange = percent(spendBefore, spendNow);
  const convChange = percent(convBefore, convNow);

  const tickInterval = Math.max(1, Math.ceil(formatted.length / 7));

  return (
    <Panel className="flex flex-col p-5">
      <PanelHeader
        eyebrow="Performance overview"
        title="Spend and conversions"
        description="Daily trajectory across every connected platform."
        actions={
          <div className="seg" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                data-active={range === r}
                className="seg-item"
                aria-pressed={range === r}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-mist-400">Spend</span>
          <span className="text-[13px] font-semibold text-mist-50 tabular-nums">
            {formatNaira(spendNow)}
          </span>
          {previous.length > 0 && (
            <span
              className={
                "text-[11px] font-medium tabular-nums " +
                (spendChange <= 0 ? "text-brand-300" : "text-amber-300")
              }
            >
              {spendChange >= 0 ? "+" : ""}
              {spendChange.toFixed(1)}%
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-mist-400">Conversions</span>
          <span className="text-[13px] font-semibold text-mist-50 tabular-nums">
            {convNow.toLocaleString()}
          </span>
          {previous.length > 0 && (
            <span
              className={
                "text-[11px] font-medium tabular-nums " +
                (convChange >= 0 ? "text-brand-300" : "text-rose-300")
              }
            >
              {convChange >= 0 ? "+" : ""}
              {convChange.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 min-h-[236px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{ top: 12, right: 4, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trend-spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.green} stopOpacity={0.22} />
                <stop offset="100%" stopColor={SERIES.green} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trend-conv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.blue} stopOpacity={0.18} />
                <stop offset="100%" stopColor={SERIES.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={GRID.stroke}
              strokeDasharray={GRID.strokeDasharray}
              vertical={GRID.vertical}
            />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
              dy={6}
            />
            <YAxis
              yAxisId="left"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactNumber(v)}
              width={52}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ stroke: "rgba(255,255,255,0.16)", strokeWidth: 1 }}
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
              stroke={SERIES.green}
              strokeWidth={1.75}
              fill="url(#trend-spend)"
              activeDot={{ r: 3, strokeWidth: 0 }}
              dot={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke={SERIES.blue}
              strokeWidth={1.75}
              fill="url(#trend-conv)"
              activeDot={{ r: 3, strokeWidth: 0 }}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-mist-300">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: SERIES.green }}
              aria-hidden
            />
            <MetricTooltip
              content={SpendLegendTip}
              label="What the daily spend line means"
              side="bottom"
            >
              <span>Spend</span>
            </MetricTooltip>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-mist-300">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: SERIES.blue }}
              aria-hidden
            />
            <MetricTooltip
              content={ConversionsLegendTip}
              label="What the daily conversions line means"
              side="bottom"
            >
              <span>Conversions</span>
            </MetricTooltip>
          </span>
        </div>
        <p className="text-[11px] text-mist-500">
          {previous.length > 0
            ? `Spend ${spendChange <= 0 ? "down" : "up"} ${Math.abs(
                spendChange
              ).toFixed(1)}% while conversions ${
                convChange >= 0 ? "grew" : "fell"
              } ${Math.abs(convChange).toFixed(1)}% vs the previous ${range} days.`
            : `Daily totals · latest ${range} days of activity.`}
        </p>
      </div>
    </Panel>
  );
}

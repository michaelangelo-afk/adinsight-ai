"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList
} from "recharts";
import type { DashboardSummary } from "@/lib/types";
import { formatNaira, formatPercent } from "@/lib/utils";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { MetricTooltip } from "@/components/ui/tooltip";
import {
  MetaBriefTip,
  GoogleBriefTip,
  TiktokBriefTip,
  BestCostPerConvTip
} from "@/lib/metric-tooltips";
import {
  SERIES,
  AXIS_TICK,
  GRID,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE
} from "@/lib/chart-theme";
import { Panel, PanelHeader } from "@/components/ui/panel";

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  meta: { name: "Meta", color: SERIES.blue },
  google: { name: "Google", color: SERIES.green },
  tiktok: { name: "TikTok", color: SERIES.violet }
};

type View = "spend" | "conversions";

export function PlatformChart({ data }: { data: DashboardSummary["platformBreakdown"] }) {
  const [view, setView] = React.useState<View>("spend");

  const totalSpend = data.reduce((s, d) => s + d.spend, 0);
  const sorted = [...data].sort((a, b) => b.spend - a.spend);
  const chartData = sorted.map((d) => ({
    platform: PLATFORM_META[d.platform]?.name ?? d.platform,
    spend: d.spend,
    conversions: d.conversions,
    share: totalSpend ? d.spend / totalSpend : 0,
    orig: d.platform,
    color: PLATFORM_META[d.platform]?.color ?? SERIES.violet
  }));

  // Best efficiency, derived from the data rather than asserted.
  const best = [...data]
    .filter((d) => d.conversions > 0)
    .sort((a, b) => a.spend / a.conversions - b.spend / b.conversions)[0];

  const isSpend = view === "spend";

  return (
    <Panel className="flex flex-col p-5">
      <PanelHeader
        eyebrow="Channel performance"
        title={isSpend ? "Spend by channel" : "Conversions by channel"}
        description={
          isSpend
            ? `${formatNaira(totalSpend)} across ${data.length} channels.`
            : `${data
                .reduce((s, d) => s + d.conversions, 0)
                .toLocaleString()} conversions this period.`
        }
        actions={
          <div className="seg" role="group" aria-label="Metric">
            <button
              type="button"
              onClick={() => setView("spend")}
              data-active={isSpend}
              className="seg-item"
              aria-pressed={isSpend}
            >
              Spend
            </button>
            <button
              type="button"
              onClick={() => setView("conversions")}
              data-active={!isSpend}
              className="seg-item"
              aria-pressed={!isSpend}
            >
              Conv.
            </button>
          </div>
        }
      />

      <div className="mt-3 min-h-[168px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 4, left: 0, bottom: 0 }}
            barCategoryGap="34%"
          >
            <defs>
              {chartData.map((d) => (
                <linearGradient
                  key={d.orig}
                  id={`bar-${d.orig}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={d.color} stopOpacity={0.35} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="platform"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                isSpend ? `₦${Math.round(v / 1000)}k` : String(v)
              }
              width={54}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.035)" }}
              formatter={(value) => {
                const v = typeof value === "number" ? value : Number(value) || 0;
                return isSpend ? [formatNaira(v), "Spend"] : [v, "Conversions"];
              }}
            />
            <Bar
              dataKey={view}
              radius={[4, 4, 0, 0]}
              maxBarSize={54}
              isAnimationActive={false}
            >
              {chartData.map((d) => (
                <Cell key={d.orig} fill={`url(#bar-${d.orig})`} />
              ))}
              <LabelList
                dataKey={view}
                position="top"
                fill="#A4B0C4"
                fontSize={10.5}
                offset={6}
                formatter={(v: number) =>
                  isSpend ? `₦${Math.round(v / 1000)}k` : String(v)
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-0.5 border-t border-white/[0.06] pt-2">
        {chartData.map((p) => {
          const tip =
            p.orig === "meta"
              ? MetaBriefTip
              : p.orig === "google"
              ? GoogleBriefTip
              : p.orig === "tiktok"
              ? TiktokBriefTip
              : null;
          const ariaLabel =
            p.orig === "meta"
              ? "What Meta Ads means"
              : p.orig === "google"
              ? "What Google Ads means"
              : p.orig === "tiktok"
              ? "What TikTok Ads means"
              : `What ${p.platform} Ads means`;
          return (
            <div
              key={p.platform}
              className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${p.color}1a` }}
              >
                <PlatformLogo
                  platform={p.orig}
                  size="xs"
                  fallback={
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: p.color }}
                      aria-hidden="true"
                    />
                  }
                />
              </span>
              <span className="flex-1 truncate text-[12px] text-mist-200">
                {tip ? (
                  <MetricTooltip content={tip} label={ariaLabel} side="top">
                    <span>{p.platform}</span>
                  </MetricTooltip>
                ) : (
                  p.platform
                )}
              </span>
              <span className="text-[11.5px] tabular-nums text-mist-300">
                {p.conversions.toLocaleString()} conv
              </span>
              <span className="hidden w-12 sm:block" aria-hidden>
                <span className="block h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(3, p.share * 100)}%`,
                      background: p.color
                    }}
                  />
                </span>
              </span>
              <span className="w-9 text-right text-[11px] tabular-nums text-mist-400">
                {formatPercent(p.share, 0)}
              </span>
            </div>
          );
        })}
      </div>

      {best && (
        <div className="mt-3 rounded-lg border border-brand-500/25 bg-brand-500/[0.07] px-3 py-2.5 text-[11.5px] leading-relaxed text-mist-200">
          <strong className="font-semibold text-brand-300">
            <MetricTooltip
              content={BestCostPerConvTip}
              label="What best cost-per-conversion means"
              side="top"
            >
              <span>Best cost per conversion</span>
            </MetricTooltip>
            :
          </strong>{" "}
          {PLATFORM_META[best.platform]?.name ?? best.platform} at{" "}
          <span className="font-medium text-mist-50 tabular-nums">
            {formatNaira(best.spend / best.conversions)}
          </span>{" "}
          — the cheapest of the {data.length} channels you run.
        </div>
      )}
    </Panel>
  );
}

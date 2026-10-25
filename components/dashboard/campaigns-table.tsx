"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { MetricTooltip } from "@/components/ui/tooltip";
import { Panel, PanelHeader } from "@/components/ui/panel";
import type { CampaignSummary } from "@/lib/types";
import { formatNaira, formatPercent } from "@/lib/utils";
import { updateCampaign } from "@/app/actions/meta";
import { SERIES } from "@/lib/chart-theme";
import {
  ColumnSpendTip,
  ColumnConversionsTip,
  ColumnCpcTip,
  TrendSparklineTip
} from "@/lib/metric-tooltips";

type SortKey = "spend" | "conversions" | "cpc";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "spend", label: "Spend" },
  { id: "conversions", label: "Conv." },
  { id: "cpc", label: "CPC" }
];

function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const w = 64;
  const h = 20;
  if (data.length < 2) return <span className="inline-block w-16" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-5 w-16"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={tone}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PlatformMark({ platform, color }: { platform: string; color: string }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: `${color}1a` }}
    >
      <PlatformLogo
        platform={platform}
        size="xs"
        fallback={
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
            aria-hidden="true"
          />
        }
      />
    </span>
  );
}

const PLATFORM_COLOR: Record<string, string> = {
  meta: SERIES.blue,
  google: SERIES.green,
  tiktok: SERIES.violet
};

function statusTone(
  status: "active" | "paused" | "completed"
): "good" | "warn" | "neutral" {
  if (status === "active") return "good";
  if (status === "paused") return "warn";
  return "neutral";
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignSummary[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("spend");

  const sorted = React.useMemo(() => {
    const rows = [...campaigns];
    if (sortKey === "cpc") return rows.sort((a, b) => a.cpc - b.cpc);
    return rows.sort((a, b) => b[sortKey] - a[sortKey]);
  }, [campaigns, sortKey]);

  return (
    <Panel className="flex flex-col p-5">
      <PanelHeader
        eyebrow="Campaigns"
        title="Top campaigns"
        description="Sort by spend, conversions or cost per click."
        actions={
          <div className="seg" role="group" aria-label="Sort campaigns">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortKey(s.id)}
                data-active={sortKey === s.id}
                className="seg-item"
                aria-pressed={sortKey === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="-mx-1 mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.08em] text-mist-500">
              <th className="px-1 pb-2 text-left font-medium">Campaign</th>
              <th className="px-2 pb-2 text-right font-medium">
                <span className="inline-flex w-full justify-end">
                  <MetricTooltip
                    content={ColumnSpendTip}
                    label="What spend means"
                    side="bottom"
                  >
                    <span>Spend</span>
                  </MetricTooltip>
                </span>
              </th>
              <th className="hidden px-2 pb-2 text-right font-medium sm:table-cell">
                <span className="inline-flex w-full justify-end">
                  <MetricTooltip
                    content={ColumnConversionsTip}
                    label="What conversions means"
                    side="bottom"
                  >
                    <span>Conv.</span>
                  </MetricTooltip>
                </span>
              </th>
              <th className="hidden px-2 pb-2 text-right font-medium sm:table-cell">
                <span className="inline-flex w-full justify-end">
                  <MetricTooltip
                    content={ColumnCpcTip}
                    label="What CPC means"
                    side="bottom"
                  >
                    <span>CPC</span>
                  </MetricTooltip>
                </span>
              </th>
              <th className="hidden px-2 pb-2 text-right font-medium md:table-cell">
                <span className="inline-flex w-full justify-end">
                  <MetricTooltip
                    content={TrendSparklineTip}
                    label="What the trend sparkline means"
                    side="bottom"
                  >
                    <span>Trend</span>
                  </MetricTooltip>
                </span>
              </th>
              <th className="pb-2 pl-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-[12px] text-mist-500"
                >
                  No campaigns yet. Connect an ad account to begin syncing.
                </td>
              </tr>
            )}
            {sorted.map((c) => {
              const color = PLATFORM_COLOR[c.platform] ?? SERIES.violet;
              const tone =
                c.status === "active"
                  ? SERIES.green
                  : c.status === "paused"
                  ? SERIES.amber
                  : SERIES.rose;
              const isActive = c.status === "active";
              return (
                <tr
                  key={c.id}
                  className="group border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-1 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PlatformMark platform={c.platform} color={color} />
                      <div className="min-w-0">
                        <div className="max-w-[13rem] truncate text-[12.5px] font-medium text-mist-50">
                          {c.name}
                        </div>
                        <div className="text-[10.5px] capitalize text-mist-500">
                          {c.platform} · {formatPercent(c.ctr, 2)} CTR
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right font-medium tabular-nums text-mist-100">
                    {formatNaira(c.spend)}
                  </td>
                  <td className="hidden px-2 py-2.5 text-right tabular-nums text-mist-300 sm:table-cell">
                    {c.conversions}
                  </td>
                  <td className="hidden px-2 py-2.5 text-right tabular-nums text-mist-300 sm:table-cell">
                    ₦{c.cpc.toFixed(2)}
                  </td>
                  <td className="hidden px-2 py-2.5 md:table-cell">
                    <div className="flex justify-end">
                      <Sparkline data={c.trend} tone={tone} />
                    </div>
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Badge tone={statusTone(c.status)} dot>
                        {c.status}
                      </Badge>
                      <form
                        action={updateCampaign.bind(
                          null,
                          c.id,
                          isActive ? "PAUSED" : "ACTIVE"
                        )}
                        className="contents"
                      >
                        <button
                          type="submit"
                          aria-label={
                            isActive ? `Pause ${c.name}` : `Resume ${c.name}`
                          }
                          title={
                            isActive
                              ? `Pause ${c.name} on Meta`
                              : `Resume ${c.name} on Meta`
                          }
                          className="rounded p-1 text-mist-600 opacity-0 transition-all hover:bg-white/[0.06] hover:text-mist-200 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          {isActive ? (
                            <Pause size={11} aria-hidden />
                          ) : (
                            <Play size={11} aria-hidden />
                          )}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-[11px] text-mist-500">
          {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} ·{" "}
          {campaigns.filter((c) => c.status === "active").length} active
        </span>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-mist-300 transition-colors hover:text-brand-300"
        >
          View all campaigns
          <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
    </Panel>
  );
}

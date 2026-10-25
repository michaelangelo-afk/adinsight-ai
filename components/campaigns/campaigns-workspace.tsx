"use client";

import * as React from "react";
import {
  ArrowUpRight,
  LayoutGrid,
  List,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import type { CampaignStatus, CampaignSummary } from "@/lib/types";
import { formatNaira, formatPercent } from "@/lib/utils";
import { SERIES } from "@/lib/chart-theme";
import { updateCampaign } from "@/app/actions/meta";

const PLATFORM_LABEL: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok"
};

const PLATFORM_COLOR: Record<string, string> = {
  meta: SERIES.blue,
  google: SERIES.green,
  tiktok: SERIES.violet
};

const PLATFORMS = ["meta", "google", "tiktok"] as const;
const STATUSES: CampaignStatus[] = ["active", "paused", "completed"];

const OBJECTIVES = [
  "conversions",
  "leads",
  "traffic",
  "awareness",
  "engagement"
] as const;

type SortKey = "spend" | "conversions" | "cpc" | "name";
type View = "grid" | "list";

function statusTone(
  status: CampaignStatus
): "good" | "warn" | "neutral" {
  if (status === "active") return "good";
  if (status === "paused") return "warn";
  return "neutral";
}

function platformTint(platform: string): string {
  return PLATFORM_COLOR[platform] ?? SERIES.violet;
}

function trendDelta(trend: number[]): number {
  if (trend.length < 2) return 0;
  const first = trend[0] || 1;
  return ((trend[trend.length - 1] - first) / first) * 100;
}

/** 22px trend strip used in both card and list layouts. */
function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const w = 56;
  const h = 18;
  if (data.length < 2) return <span className="inline-block w-14" />;
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
      className="h-[18px] w-14"
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

function Toggle({
  checked,
  onChange,
  label,
  count,
  tone
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  tone?: string;
}) {
  return (
    <label className="flex h-7 cursor-pointer items-center gap-2 rounded-md px-1 text-[12px] text-mist-300 transition-colors hover:text-mist-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.04] accent-brand-500"
      />
      {tone && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tone }}
          aria-hidden
        />
      )}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-[10.5px] tabular-nums text-mist-600">{count}</span>
      )}
    </label>
  );
}

function FilterGroup({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/[0.06] px-1 py-3 first:border-t-0 first:pt-0">
      <div className="stat-label mb-1.5">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function CampaignsWorkspace({
  campaigns
}: {
  campaigns: CampaignSummary[];
}) {
  const [query, setQuery] = React.useState("");
  const [platforms, setPlatforms] = React.useState<string[]>([]);
  const [statuses, setStatuses] = React.useState<CampaignStatus[]>([]);
  const [objectives, setObjectives] = React.useState<string[]>([]);
  const [minBudget, setMinBudget] = React.useState("");
  const [maxBudget, setMaxBudget] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("spend");
  const [view, setView] = React.useState<View>("grid");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minBudget ? Number(minBudget) : null;
    const max = maxBudget ? Number(maxBudget) : null;

    return campaigns.filter((c) => {
      if (platforms.length && !platforms.includes(c.platform)) return false;
      if (statuses.length && !statuses.includes(c.status)) return false;
      if (objectives.length && !objectives.includes(c.objective)) return false;
      if (min !== null && c.budget < min) return false;
      if (max !== null && c.budget > max) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q) ||
        c.objective.toLowerCase().includes(q)
      );
    });
  }, [campaigns, query, platforms, statuses, objectives, minBudget, maxBudget]);

  const sorted = React.useMemo(() => {
    const rows = [...filtered];
    if (sort === "cpc") return rows.sort((a, b) => a.cpc - b.cpc);
    if (sort === "name") return rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows.sort((a, b) => b[sort] - a[sort]);
  }, [filtered, sort]);

  const activeFilters =
    platforms.length + statuses.length + objectives.length +
    (minBudget ? 1 : 0) + (maxBudget ? 1 : 0);

  const clearFilters = () => {
    setPlatforms([]);
    setStatuses([]);
    setObjectives([]);
    setMinBudget("");
    setMaxBudget("");
    setQuery("");
  };

  const filters = (
    <Panel className="p-4">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={12} className="text-mist-400" aria-hidden />
          <span className="text-[12px] font-medium text-mist-100">Filters</span>
          {activeFilters > 0 && (
            <span className="rounded bg-brand-500/15 px-1 text-[10px] font-semibold text-brand-300">
              {activeFilters}
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-0.5 text-[10.5px] text-mist-500 transition-colors hover:text-mist-200"
          >
            <X size={10} aria-hidden />
            Reset
          </button>
        )}
      </div>

      <FilterGroup title="Platform">
        {PLATFORMS.map((p) => (
          <Toggle
            key={p}
            label={PLATFORM_LABEL[p]}
            tone={PLATFORM_COLOR[p]}
            checked={platforms.includes(p)}
            onChange={() => toggle(platforms, p, setPlatforms)}
            count={campaigns.filter((c) => c.platform === p).length}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Status">
        {STATUSES.map((s) => (
          <Toggle
            key={s}
            label={s[0].toUpperCase() + s.slice(1)}
            checked={statuses.includes(s)}
            onChange={() => toggle(statuses, s, setStatuses)}
            count={campaigns.filter((c) => c.status === s).length}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Budget range (₦)">
        <div className="flex items-center gap-1.5 px-1">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="Min"
            aria-label="Minimum budget"
            className="h-7 w-full min-w-0 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[11.5px] text-mist-100 placeholder:text-mist-600 focus:border-brand-500/50 focus:outline-none"
          />
          <span className="text-mist-600" aria-hidden>
            –
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max"
            aria-label="Maximum budget"
            className="h-7 w-full min-w-0 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[11.5px] text-mist-100 placeholder:text-mist-600 focus:border-brand-500/50 focus:outline-none"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Objective">
        {OBJECTIVES.map((o) => (
          <Toggle
            key={o}
            label={o[0].toUpperCase() + o.slice(1)}
            checked={objectives.includes(o)}
            onChange={() => toggle(objectives, o, setObjectives)}
            count={campaigns.filter((c) => c.objective === o).length}
          />
        ))}
      </FilterGroup>
    </Panel>
  );

  return (
    <div className="relative flex-1 px-4 py-6 md:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-page-glow"
      />

      <PageHeader
        eyebrow="Campaign management"
        title="Campaigns"
        description="Monitor and manage every campaign across Meta, Google and TikTok. Pause from here; changes are queued against the connected account."
        actions={
          <>
            <div className="seg" role="group" aria-label="Layout">
              <button
                type="button"
                onClick={() => setView("grid")}
                data-active={view === "grid"}
                className="seg-item"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid size={13} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                data-active={view === "list"}
                className="seg-item"
                aria-label="List view"
                aria-pressed={view === "list"}
              >
                <List size={13} aria-hidden />
              </button>
            </div>
            <Link
              href="/channels"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-500"
            >
              <ArrowUpRight size={12} aria-hidden />
              Launch campaign
            </Link>
          </>
        }
      />

      <div className="mt-5 flex flex-col gap-3 lg:flex-row">
        {/* Filter rail */}
        <div className="hidden w-[232px] shrink-0 lg:block">
          <div className="sticky top-[72px]">{filters}</div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search
                size={13}
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mist-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns…"
                aria-label="Search campaigns"
                className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-[12px] text-mist-100 placeholder:text-mist-600 focus:border-brand-500/50 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 text-[11.5px] font-medium text-mist-300 transition-colors hover:bg-white/[0.04] hover:text-mist-50 lg:hidden"
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={12} aria-hidden />
              Filters
              {activeFilters > 0 && (
                <span className="rounded bg-brand-500/15 px-1 text-[10px] font-semibold text-brand-300">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-[11px] text-mist-500 sm:inline">
                {sorted.length} of {campaigns.length}
              </span>
              <label className="sr-only" htmlFor="campaign-sort">
                Sort campaigns
              </label>
              <select
                id="campaign-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[11.5px] text-mist-200 focus:border-brand-500/50 focus:outline-none"
              >
                <option value="spend">Sort: spend</option>
                <option value="conversions">Sort: conversions</option>
                <option value="cpc">Sort: cheapest CPC</option>
                <option value="name">Sort: name</option>
              </select>
            </div>
          </div>

          {filtersOpen && <div className="mt-3 lg:hidden">{filters}</div>}

          {sorted.length === 0 ? (
            <Panel className="mt-4 p-10 text-center">
              <p className="text-[13px] text-mist-300">
                No campaigns match those filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-[12px] font-medium text-brand-300 hover:text-brand-200"
              >
                Clear filters
              </button>
            </Panel>
          ) : view === "grid" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {sorted.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  totalSpend={totalSpend}
                  totalConversions={totalConversions}
                />
              ))}
            </div>
          ) : (
            <Panel className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.08em] text-mist-500">
                      <th className="px-4 py-2.5 text-left font-medium">
                        Campaign
                      </th>
                      <th className="px-2 py-2.5 text-left font-medium">
                        Status
                      </th>
                      <th className="px-2 py-2.5 text-right font-medium">
                        Spend / budget
                      </th>
                      <th className="px-2 py-2.5 text-right font-medium">
                        Conv.
                      </th>
                      <th className="px-2 py-2.5 text-right font-medium">
                        CPC
                      </th>
                      <th className="px-2 py-2.5 text-right font-medium">
                        CTR
                      </th>
                      <th className="px-2 py-2.5 text-right font-medium">
                        Trend
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c) => (
                      <CampaignRow key={c.id} campaign={c} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignCard({
  campaign: c,
  totalSpend,
  totalConversions
}: {
  campaign: CampaignSummary;
  totalSpend: number;
  totalConversions: number;
}) {
  const color = platformTint(c.platform);
  const used = c.budget > 0 ? Math.min(100, (c.spend / c.budget) * 100) : 0;
  const over = c.budget > 0 && c.spend > c.budget;
  const spendShare = totalSpend ? c.spend / totalSpend : 0;
  const convShare = totalConversions ? c.conversions / totalConversions : 0;
  const delta = trendDelta(c.trend);

  return (
    <article className="glass-card panel-interactive flex flex-col rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${color}1c`,
              boxShadow: `inset 0 0 0 1px ${color}2e`
            }}
          >
            <PlatformLogo
              platform={c.platform}
              size="xs"
              fallback={
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: color }}
                  aria-hidden
                />
              }
            />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-medium text-mist-50">
              {c.name}
            </h3>
            <div className="truncate text-[10.5px] capitalize text-mist-500">
              {PLATFORM_LABEL[c.platform] ?? c.platform} · {c.objective}
            </div>
          </div>
        </div>
        <Badge tone={statusTone(c.status)} dot>
          {c.status}
        </Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="stat-label">Spend</div>
          <div className="mt-1 text-[23px] font-semibold leading-none tracking-[-0.025em] text-mist-50 tabular-nums">
            {formatNaira(c.spend)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={
              "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums " +
              (over
                ? "bg-rose-500/[0.14] text-rose-300"
                : "bg-white/[0.05] text-mist-200")
            }
          >
            {used.toFixed(0)}% used
          </span>
          <span className="text-[10px] text-mist-500">
            of {formatNaira(c.budget)}
          </span>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.055]"
        role="progressbar"
        aria-valuenow={Math.round(used)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget used for ${c.name}`}
      >
        <div
          className={
            "h-full rounded-full " +
            (over ? "bg-rose-400" : "bg-brand-400")
          }
          style={{
            width: `${used}%`,
            boxShadow: over
              ? "0 0 12px rgba(251,113,133,0.35)"
              : "0 0 12px rgba(52,211,153,0.30)"
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-lg border border-white/[0.055] bg-white/[0.015]">
        <Metric label="Conversions" value={c.conversions.toLocaleString()} />
        <Metric label="CPC" value={`₦${c.cpc.toFixed(2)}`} />
        <Metric label="CTR" value={formatPercent(c.ctr, 2)} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2">
          <Sparkline data={c.trend} tone={color} />
          <span
            className={
              "text-[10.5px] font-medium tabular-nums " +
              (delta >= 0 ? "text-brand-300" : "text-rose-300")
            }
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-mist-600">
            {formatPercent(spendShare, 0)} of spend · {formatPercent(convShare, 0)}{" "}
            of results
          </span>
          <PauseResume campaign={c} />
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 first:rounded-l-lg last:rounded-r-lg">
      <div className="text-[9.5px] uppercase tracking-[0.07em] text-mist-500">
        {label}
      </div>
      <div className="mt-1 text-[12.5px] font-semibold tabular-nums text-mist-100">
        {value}
      </div>
    </div>
  );
}

function PauseResume({ campaign: c }: { campaign: CampaignSummary }) {
  const isActive = c.status === "active";
  return (
    <form
      action={updateCampaign.bind(null, c.id, isActive ? "PAUSED" : "ACTIVE")}
    >
      <button
        type="submit"
        aria-label={isActive ? `Pause ${c.name}` : `Resume ${c.name}`}
        title={isActive ? `Pause ${c.name}` : `Resume ${c.name}`}
        className="inline-flex h-6 items-center gap-1 rounded-md border border-white/[0.08] px-1.5 text-[10.5px] font-medium text-mist-300 transition-colors hover:border-white/[0.16] hover:text-mist-50"
      >
        {isActive ? <Pause size={10} aria-hidden /> : <Play size={10} aria-hidden />}
        {isActive ? "Pause" : "Resume"}
      </button>
    </form>
  );
}

function CampaignRow({ campaign: c }: { campaign: CampaignSummary }) {
  const color = platformTint(c.platform);
  const delta = trendDelta(c.trend);
  return (
    <tr className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]">
      <td className="px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}1a` }}
          >
            <PlatformLogo
              platform={c.platform}
              size="xs"
              fallback={
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: color }}
                  aria-hidden
                />
              }
            />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-mist-50">
              {c.name}
            </div>
            <div className="text-[10.5px] capitalize text-mist-500">
              {PLATFORM_LABEL[c.platform] ?? c.platform} · {c.objective}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-2.5">
        <Badge tone={statusTone(c.status)} dot>
          {c.status}
        </Badge>
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-mist-100">
        {formatNaira(c.spend)}
        <span className="text-mist-600"> / {formatNaira(c.budget)}</span>
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-mist-300">
        {c.conversions}
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-mist-300">
        ₦{c.cpc.toFixed(2)}
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-mist-300">
        {formatPercent(c.ctr, 2)}
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center justify-end gap-1.5">
          <Sparkline data={c.trend} tone={color} />
          <span
            className={
              "text-[10.5px] tabular-nums " +
              (delta >= 0 ? "text-brand-300" : "text-rose-300")
            }
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-right">
        <PauseResume campaign={c} />
      </td>
    </tr>
  );
}

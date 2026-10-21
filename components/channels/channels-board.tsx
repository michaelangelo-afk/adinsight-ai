"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChannelGlyph } from "@/components/channels/channel-glyph";
import { ChannelDetail } from "@/components/channels/channel-detail";
import { AssistedLaunch } from "@/components/channels/assisted-launch";
import {
  buildOrder,
  catalogStats,
  type Channel,
  type ChannelGroup
} from "@/lib/platforms/catalog";
import {
  GROUP_LABELS,
  reachLabel,
  reachTitle,
  statusOf,
  STATUS_LABELS,
  STATUS_TONES,
  STATUS_BADGE_CLASS,
  type ChannelStatus
} from "@/lib/channels/display";
import type { AssistedChannelId } from "@/lib/channels/assisted";
import {
  clearLaunches,
  readLaunches,
  type LaunchRecord
} from "@/lib/channels/launch-log";
import { cn } from "@/lib/utils";

const CHANNELS = buildOrder();

interface ChannelsBoardProps {
  defaultBusiness: string;
}

const STATUS_FILTERS: Array<{ id: ChannelStatus | "all"; label: string }> = [
  { id: "all", label: "All statuses" },
  { id: "live", label: "Live" },
  { id: "api", label: "API ready" },
  { id: "assisted", label: "Assisted" },
  { id: "sales", label: "Sales-led" }
];

function actionLabel(status: ChannelStatus): string {
  if (status === "live") return "Open dashboard";
  if (status === "assisted") return "Build kit";
  if (status === "api") return "View API";
  return "View playbook";
}

function StatusBadge({ channel }: { channel: Channel }) {
  const status = statusOf(channel);
  return (
    <Badge tone={STATUS_TONES[status]} className={STATUS_BADGE_CLASS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function ChannelsBoard({ defaultBusiness }: ChannelsBoardProps) {
  const [query, setQuery] = React.useState("");
  const [group, setGroup] = React.useState<ChannelGroup | "all">("all");
  const [status, setStatus] = React.useState<ChannelStatus | "all">("all");
  const [selected, setSelected] = React.useState<Channel | null>(null);
  const [assistId, setAssistId] = React.useState<AssistedChannelId | null>(null);
  const [launches, setLaunches] = React.useState<LaunchRecord[]>([]);

  React.useEffect(() => {
    setLaunches(readLaunches());
  }, []);

  const stats = React.useMemo(() => catalogStats(), []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHANNELS.filter((channel) => {
      if (group !== "all" && channel.group !== group) return false;
      if (status !== "all" && statusOf(channel) !== status) return false;
      if (!q) return true;
      return (
        channel.name.toLowerCase().includes(q) ||
        channel.playbook.toLowerCase().includes(q) ||
        GROUP_LABELS[channel.group].toLowerCase().includes(q)
      );
    });
  }, [query, group, status]);

  const groups = Object.entries(GROUP_LABELS) as Array<[ChannelGroup, string]>;

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      <section
        aria-label="Channel coverage"
        className="relative overflow-hidden rounded-3xl border border-mist-50/10 bg-gradient-to-br from-brand-500/15 via-ink-950/70 to-brand-500/[0.08] p-6 sm:p-8"
      >
        <div aria-hidden className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative grid gap-6 lg:grid-cols-[1.5fr,1fr] lg:items-center">
          <div>
            <Badge tone="brand">Channel coverage</Badge>
            <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-mist-50 sm:text-4xl md:text-5xl">
              Every channel.
              <br />
              <span className="gradient-text">One honest status.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-300 sm:text-base">
              {stats.total} channels mapped by reach, cost and access. Connect
              where a real API exists. Build the listing where it does not. No
              fake integrations, no browser bots.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {[
                `${stats.total} channels`,
                `${stats.officialWrite} write APIs`,
                `${stats.assisted} assisted`,
                `${stats.playwrightPosting} Playwright`
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-mist-50/10 bg-mist-50/[0.04] px-3 py-1.5 text-mist-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Live now" value="1" hint="Meta OAuth" />
            <StatTile label="API ready" value={String(stats.officialWrite)} hint="Read + write" />
            <StatTile label="Assisted" value={String(stats.assisted)} hint="You press publish" />
            <StatTile label="Browser posting" value="0" hint="By policy" tone="warn" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/[0.06] p-4 sm:flex-row sm:items-start">
        <ShieldCheck
          size={18}
          aria-hidden
          className="mt-0.5 shrink-0 text-brand-300"
        />
        <p className="text-sm leading-relaxed text-mist-200">
          <strong className="text-mist-50">No browser automation.</strong>{" "}
          Jiji, Nairaland and Marketplace forbid automated posting, and the
          majors require their own APIs. Assisted launch writes the listing,
          adds a tracked link and opens the platform&apos;s composer — you press
          publish.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-mist-50/10 bg-ink-900/60 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels, playbooks, groups…"
            aria-label="Search channels"
            className="h-11 w-full rounded-xl border border-mist-50/10 bg-mist-50/[0.04] pl-9 pr-3 text-sm text-mist-50 placeholder:text-mist-400 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as ChannelGroup | "all")}
          aria-label="Filter by group"
          className="h-11 rounded-xl border border-mist-50/10 bg-ink-950 px-3 text-sm text-mist-200 focus:border-brand-500/50 focus:outline-none"
        >
          <option value="all">All groups</option>
          {groups.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ChannelStatus | "all")
          }
          aria-label="Filter by status"
          className="h-11 rounded-xl border border-mist-50/10 bg-ink-950 px-3 text-sm text-mist-200 focus:border-brand-500/50 focus:outline-none"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="shrink-0 px-1 text-xs text-mist-400">
          {filtered.length} shown
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-mist-50/15 p-10 text-center">
          <Sparkles size={20} aria-hidden className="mx-auto text-mist-400" />
          <p className="mt-2 text-sm text-mist-300">
            No channel matches that filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGroup("all");
              setStatus("all");
            }}
            className="mt-3 text-xs text-brand-300 hover:text-brand-200"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((channel) => {
            const channelStatus = statusOf(channel);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSelected(channel)}
                aria-label={`View ${channel.name}`}
                className="group flex flex-col rounded-2xl border border-mist-50/10 bg-ink-900/60 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:bg-ink-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white px-2">
                    <ChannelGlyph
                      channelId={channel.id}
                      group={channel.group}
                    />
                  </span>
                  <StatusBadge channel={channel} />
                </div>

                <h2 className="mt-4 text-base font-semibold tracking-tight text-mist-50">
                  {channel.name}
                </h2>
                <div
                  className="mt-1 text-sm text-mist-200"
                  title={reachTitle(channel)}
                >
                  {reachLabel(channel)}
                </div>
                <div className="mt-0.5 text-xs text-mist-400">
                  {channel.economics.entry}
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-mist-400">
                  {channel.playbook}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-mist-50/[0.06] pt-4">
                  <span className="text-[11px] uppercase tracking-wider text-mist-400">
                    Wave {channel.wave} · {channel.effort}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 transition-transform group-hover:translate-x-0.5">
                    {actionLabel(channelStatus)}
                    <ArrowUpRight size={12} aria-hidden />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {launches.length > 0 && (
        <section
          aria-label="Recent assisted launches"
          className="rounded-2xl border border-mist-50/10 bg-ink-900/60 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-mist-50">
                Recent assisted launches
              </h2>
              <p className="text-xs text-mist-400">
                Stored on this device only. The platform remains the source of
                truth.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearLaunches();
                setLaunches([]);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-mist-50/10 px-3 py-1.5 text-xs text-mist-400 transition-colors hover:border-rose-500/30 hover:text-rose-300"
            >
              <Trash2 size={12} aria-hidden />
              Clear
            </button>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {launches.map((launch) => (
              <li
                key={launch.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-mist-50/[0.06] bg-mist-50/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-mist-100">
                    {launch.title}
                  </div>
                  <div className="text-xs text-mist-400">
                    {launch.channelName} ·{" "}
                    {new Date(launch.at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short"
                    })}
                  </div>
                </div>
                <a
                  href={launch.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${launch.channelName}`}
                  className="shrink-0 rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-mist-50/[0.06] hover:text-mist-50"
                >
                  <ArrowUpRight size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <ChannelDetail
          channel={selected}
          onClose={() => setSelected(null)}
          onAssist={(id) => {
            setSelected(null);
            setAssistId(id);
          }}
        />
      )}

      {assistId && (
        <AssistedLaunch
          initialChannelId={assistId}
          defaultBusiness={defaultBusiness}
          onClose={() => setAssistId(null)}
          onPublished={() => setLaunches(readLaunches())}
        />
      )}
    </main>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone = "brand"
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "brand" | "warn";
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-mist-50/10 bg-ink-950/50 p-4">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-3xl",
          tone === "warn" ? "bg-amber-500/20" : "bg-brand-500/20"
        )}
      />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-wider text-mist-400">
          {label}
        </div>
        <div
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums",
            tone === "warn" ? "text-amber-300" : "text-mist-50"
          )}
        >
          {value}
        </div>
        <div className="mt-0.5 text-[11px] text-mist-400">{hint}</div>
      </div>
    </div>
  );
}

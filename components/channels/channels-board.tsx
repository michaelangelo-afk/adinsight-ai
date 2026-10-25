"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import { ChannelGlyph } from "@/components/channels/channel-glyph";
import { ChannelDetail } from "@/components/channels/channel-detail";
import { AssistedLaunch } from "@/components/channels/assisted-launch";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import {
  buildOrder,
  catalogStats,
  type Channel,
  type ChannelGroup
} from "@/lib/platforms/catalog";
import {
  GROUP_LABELS,
  statusOf,
  STATUS_LABELS,
  type ChannelStatus
} from "@/lib/channels/display";
import type { AssistedChannelId } from "@/lib/channels/assisted";
import {
  clearLaunches,
  readLaunches,
  type LaunchRecord
} from "@/lib/channels/launch-log";

const CHANNELS = buildOrder();

interface ChannelsBoardProps {
  defaultBusiness: string;
}

const STATUS_FILTERS: Array<{ id: ChannelStatus | "all"; label: string }> = [
  { id: "all", label: "All statuses" },
  { id: "live", label: "Connected" },
  { id: "api", label: "API ready" },
  { id: "assisted", label: "Assisted" },
  { id: "sales", label: "Sales-led" }
];

/** Status light + label used at the foot of every tile. */
const STATUS_LIGHT: Record<
  ChannelStatus,
  { dot: string; text: string; label: string }
> = {
  live: { dot: "bg-brand-400", text: "text-mist-200", label: "Connected" },
  api: { dot: "bg-mist-500", text: "text-mist-400", label: "API ready" },
  assisted: { dot: "bg-amber-400", text: "text-amber-300/90", label: "Assisted" },
  sales: { dot: "bg-mist-600", text: "text-mist-500", label: "Sales-led" }
};

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
  const liveCount = React.useMemo(
    () => CHANNELS.filter((c) => statusOf(c) === "live").length,
    []
  );

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
    <main className="relative flex-1 px-4 py-6 md:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-page-glow"
      />

      <PageHeader
        eyebrow="Advertise"
        title="Channels"
        description={`${stats.total} channels mapped by Nigerian reach, cost and access. Connect where a real API exists; build the listing where it does not.`}
        actions={
          <button
            type="button"
            onClick={() => setStatus(status === "live" ? "all" : "live")}
            aria-pressed={status === "live"}
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-medium transition-colors " +
              (status === "live"
                ? "border-brand-500/35 bg-brand-500/[0.12] text-brand-200"
                : "border-white/[0.08] text-mist-300 hover:bg-white/[0.04] hover:text-mist-50")
            }
          >
            <Link2 size={12} aria-hidden />
            Connected accounts
            <span className="rounded bg-white/[0.07] px-1 text-[10px] tabular-nums">
              {liveCount}
            </span>
          </button>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-mist-500">
        <span>{stats.total} channels</span>
        <span>{stats.officialWrite} with write APIs</span>
        <span>{stats.assisted} assisted publishing</span>
        <span className="hidden items-center gap-1 sm:inline-flex">
          <ShieldCheck size={11} className="text-brand-400" aria-hidden />
          No browser automation, by policy
        </span>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={13}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mist-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels…"
            aria-label="Search channels"
            className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-[12px] text-mist-100 placeholder:text-mist-600 focus:border-brand-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="channel-group">
            Filter by group
          </label>
          <select
            id="channel-group"
            value={group}
            onChange={(e) => setGroup(e.target.value as ChannelGroup | "all")}
            className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[11.5px] text-mist-200 focus:border-brand-500/50 focus:outline-none"
          >
            <option value="all">All groups</option>
            {groups.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="channel-status">
            Filter by status
          </label>
          <select
            id="channel-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ChannelStatus | "all")
            }
            className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[11.5px] text-mist-200 focus:border-brand-500/50 focus:outline-none"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-mist-500 sm:ml-auto">
          {filtered.length} shown
        </span>
      </div>

      {filtered.length === 0 ? (
        <Panel className="mt-4 border-dashed p-10 text-center">
          <Sparkles size={18} aria-hidden className="mx-auto text-mist-500" />
          <p className="mt-2 text-[12.5px] text-mist-300">
            No channel matches that filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGroup("all");
              setStatus("all");
            }}
            className="mt-2 text-[12px] font-medium text-brand-300 hover:text-brand-200"
          >
            Clear filters
          </button>
        </Panel>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((channel) => {
            const channelStatus = statusOf(channel);
            const light = STATUS_LIGHT[channelStatus];
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSelected(channel)}
                aria-label={`${channel.name} — ${light.label}. Open details`}
                title={channel.playbook}
                className="group flex h-[126px] flex-col items-center rounded-xl border border-white/[0.07] bg-[#0A0F19] px-3 pb-2.5 pt-4 text-center transition-colors duration-150 hover:border-brand-500/30 hover:bg-[#0C121D] focus-visible:border-brand-500/50 focus-visible:outline-none"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.94] p-1.5 shadow-sm">
                  <ChannelGlyph
                    channelId={channel.id}
                    group={channel.group}
                    className="h-6 w-auto max-w-[30px]"
                  />
                </span>
                <span className="mt-2 line-clamp-2 min-h-[28px] text-[11.5px] font-medium leading-tight text-mist-100">
                  {channel.name}
                </span>
                <span className="mt-auto flex items-center gap-1.5 text-[10px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${light.dot}`}
                    aria-hidden
                  />
                  <span className={light.text}>{light.label}</span>
                  <ArrowUpRight
                    size={10}
                    aria-hidden
                    className="ml-0.5 -translate-x-0.5 text-mist-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {launches.length > 0 && (
        <section aria-label="Recent assisted launches" className="mt-5">
          <Panel className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[12.5px] font-medium text-mist-50">
                  Recent assisted launches
                </h2>
                <p className="text-[11px] text-mist-500">
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
                className="inline-flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[10.5px] text-mist-400 transition-colors hover:border-rose-500/30 hover:text-rose-300"
              >
                <Trash2 size={11} aria-hidden />
                Clear
              </button>
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {launches.map((launch) => (
                <li
                  key={launch.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12px] text-mist-100">
                      {launch.title}
                    </div>
                    <div className="text-[10.5px] text-mist-500">
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
                    className="shrink-0 rounded p-1.5 text-mist-500 transition-colors hover:bg-white/[0.06] hover:text-mist-100"
                  >
                    <ArrowUpRight size={13} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
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

import type { Channel, ChannelGroup } from "@/lib/platforms/catalog";

export type ChannelStatus = "live" | "api" | "assisted" | "sales";

export const GROUP_LABELS: Record<ChannelGroup, string> = {
  search: "Search",
  social: "Social",
  messaging: "Messaging",
  marketplace: "Marketplace",
  local: "Local",
  network: "Ad network",
  "sales-led": "Sales-led"
};

export const STATUS_LABELS: Record<ChannelStatus, string> = {
  live: "Live",
  api: "API ready",
  assisted: "Assisted",
  sales: "Sales-led"
};

export const STATUS_TONES: Record<
  ChannelStatus,
  "good" | "brand" | "warn" | "neutral"
> = {
  live: "good",
  api: "brand",
  assisted: "warn",
  sales: "neutral"
};

/**
 * The dashboard shell is always ink-950, even when the user has not toggled
 * `html.dark`. Badge's light-mode tones therefore need an explicit dark-surface
 * override here rather than relying on `dark:` twins.
 */
export const STATUS_BADGE_CLASS: Record<ChannelStatus, string> = {
  live: "!border-brand-500/30 !bg-brand-500/15 !text-brand-200",
  api: "!border-brand-500/30 !bg-brand-500/15 !text-brand-200",
  assisted: "!border-amber-500/30 !bg-amber-500/15 !text-amber-200",
  sales: "!border-mist-50/10 !bg-mist-50/[0.05] !text-mist-200"
};

/** Ink-on-emerald is 5.9:1; white on brand-600 is only 3.8:1. */
export const PRIMARY_ON_DARK =
  "!bg-brand-500 !text-ink-950 hover:!bg-brand-400 active:!bg-brand-600";

export function statusOf(channel: Channel): ChannelStatus {
  if (channel.id === "meta") return "live";
  if (channel.api.write === "full") return "api";
  if (channel.api.write === "assisted") return "assisted";
  return "sales";
}

const compact = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1
});

/** Human label for the catalog's mixed reach metrics. */
export function reachLabel(channel: Channel): string {
  const { metric, value, unit } = channel.reach;
  if (value === null) return "No public figure";
  if (metric === "browser-share" || metric === "percent-internet-users") {
    return `${value}% ${unit === "percent" ? "" : unit}`.trim();
  }
  return `${compact.format(value)} ${unit}`;
}

export function reachTitle(channel: Channel): string {
  return `${channel.reach.source} (${channel.reach.asOf}). ${channel.reach.note}`;
}

export function apiAccessLabel(channel: Channel): string {
  if (channel.api.write === "full") {
    return channel.api.read ? "Read + write" : "Write only";
  }
  if (channel.api.write === "read-only") return "Read only";
  if (channel.api.write === "assisted") return "Assisted publish";
  return "No API";
}

export function composerIdFor(channel: Channel): string | null {
  switch (channel.id) {
    case "jiji":
    case "nairaland":
    case "facebook-marketplace":
    case "whatsapp":
    case "jumia":
    case "konga":
      return channel.id;
    default:
      return null;
  }
}

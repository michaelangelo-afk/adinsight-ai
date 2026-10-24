"use client";

import type { Channel, ChannelGroup, RateMetric } from "@/lib/platforms/catalog";
import { META_NGN_CPM } from "@/lib/platforms/catalog";

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

// ============================================================================
// Rate transparency — what a naira actually buys, dated and sourced.
//
// The catalog carries economics.rate (see lib/platforms/catalog.ts). These
// helpers turn that data into drawer copy. Unknown stays unknown: a channel
// with no public Nigerian figure renders "No public benchmark", never an
// invented number.
// ============================================================================

const ngn = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** How old a verified cost figure may be before we stamp it stale. */
export const RATE_STALE_DAYS = 90;

export const RATE_UNIT_LABELS: Record<RateMetric, string> = {
  cpm: "per 1,000 impressions",
  cpc: "per click",
  "per-delivered-message": "per delivered message",
  "monthly-fixed": "per month, fixed placement",
  "minimum-budget": "minimum budget",
  none: "",
  unknown: ""
};

export interface RateView {
  /** The headline figure, e.g. "≈₦1,995 per 1,000 impressions". */
  line: string;
  asOf: string | null;
  /** True when the figure is older than RATE_STALE_DAYS. */
  stale: boolean;
  source: string | null;
  note: string | null;
}

/**
 * Adds RATE_STALE_DAYS to the first of the verification month and compares
 * to today. "YYYY-MM" only — day-level precision would be false honesty.
 */
function ageInDays(asOf: string): number | null {
  const m = /^(\d{4})-(\d{2})$/.exec(asOf);
  if (!m) return null;
  const then = Date.UTC(Number(m[1]), Number(m[2]) - 1, 1);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

export function rateView(channel: Channel): RateView | null {
  const e = channel.economics;
  const r = e?.rate;
  if (!e || !r) return null;

  let line: string;
  switch (r.metric) {
    case "none":
      line = "No media cost";
      break;
    case "unknown":
      line = "No public benchmark";
      break;
    default:
      line =
        r.amountNgn == null
          ? "No public benchmark"
          : `≈₦${ngn.format(r.amountNgn)} ${RATE_UNIT_LABELS[r.metric]}`;
  }

  const days = e.asOf ? ageInDays(e.asOf) : null;
  return {
    line,
    asOf: e.asOf ?? null,
    stale: days !== null && days > RATE_STALE_DAYS,
    source: e.source ?? null,
    note: r.note ?? null
  };
}

/**
 * The one comparison the research note actually computes: a fixed monthly
 * placement priced against Meta's Nigerian CPM. Above the break-even
 * impression count the fixed slot is cheaper per impression; below it, Meta
 * wins. Returns null for every other metric — monthly WhatsApp templates or
 * a $100 Opera floor are not CPM-comparable, and pretending otherwise would
 * be the intransparency this surface exists to prevent.
 */
export function rateCounterfactual(channel: Channel): string | null {
  const r = channel.economics?.rate;
  if (!r || r.metric !== "monthly-fixed" || r.amountNgn == null) return null;
  const breakEven = Math.round((r.amountNgn / META_NGN_CPM) * 1000);
  return `At Meta's ≈₦${ngn.format(META_NGN_CPM)} Nigerian CPM, ₦${ngn.format(
    r.amountNgn
  )}/month buys about ${breakEven.toLocaleString("en-NG")} impressions — cheaper per impression than Meta only above that count.`;
}

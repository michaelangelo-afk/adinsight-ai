/**
 * Platform capability catalog — the single source of truth for what GrowthAds
 * can read, write and merely assist with, per channel.
 *
 * Figures are dated because ad-platform access rules and Nigerian reach move.
 * Update `catalog.json`, then run `node tools/platform_catalog_check.mjs` to
 * validate invariants and print the tables used in
 * `docs/FREE-AD-PLATFORMS-NIGERIA.md`.
 *
 * This module is deliberately data-only: it describes integrations, it does not
 * perform them. See `ChannelAdapter` below for the runtime contract.
 */

import raw from "./catalog.json";

export type ChannelGroup =
  | "search"
  | "social"
  | "messaging"
  | "marketplace"
  | "local"
  | "network"
  | "sales-led";

export type ReachMetric =
  | "ad-reach"
  | "monthly-visits"
  | "members"
  | "browser-share"
  | "percent-internet-users"
  | "listings"
  | "devices"
  | "unknown";

export type WriteMode = "full" | "read-only" | "assisted" | "none";

export type AccessGate =
  | "none"
  | "account"
  | "app-review"
  | "business-verification"
  | "partner"
  | "sales-led";

export type CostModel =
  | "free"
  | "ad-spend"
  | "prepaid"
  | "per-message"
  | "sales-led";

export type BrowserPolicy = "prohibited" | "not-needed";

export type PlaywrightVerdict = "never" | "assisted-only";

export interface Channel {
  id: string;
  name: string;
  group: ChannelGroup;
  /** Build order: 1 ships first, 4 is a partnership, not code. */
  wave: 1 | 2 | 3 | 4;
  reach: {
    metric: ReachMetric;
    value: number | null;
    unit: string;
    asOf: string;
    source: string;
    note: string;
  };
  economics: {
    model: CostModel;
    entry: string;
    benchmark: string;
  };
  api: {
    read: boolean;
    write: WriteMode;
    gate: AccessGate;
    cost: "free" | "included" | "paid" | "prepaid" | "sales-led";
    quota: string;
    docs: string;
  };
  automation: {
    officialApi: boolean;
    browserAutomation: BrowserPolicy;
    playwrightVerdict: PlaywrightVerdict;
    why: string;
  };
  effort: "S" | "M" | "L";
  playbook: string;
}

export const CHANNELS = raw as unknown as Channel[];

/** Channels with a sanctioned write API — the only ones the platform can post to. */
export const OFFICIAL_WRITE_CHANNELS = CHANNELS.filter(
  (c) => c.api.write === "full"
);

/** Channels that need a human to press publish; no API exists. */
export const ASSISTED_CHANNELS = CHANNELS.filter(
  (c) => c.api.write === "assisted" || c.api.write === "none"
);

/**
 * The answer to "can Playwright be our API?" is no, for every third-party
 * channel. Browser automation is not a transport we will ship for posting.
 *
 * Permitted uses are limited to our own surfaces and public observation:
 *  - QA and screenshots of growthads.ng
 *  - regression tests in CI
 *  - public-page monitoring that respects robots.txt, with no login and no
 *    attempt to bypass CAPTCHA, 2FA or device checks
 */
export const PLAYWRIGHT_POLICY = {
  thirdPartyPosting: false,
  thirdPartyScraping: false,
  permittedUses: ["qa", "screenshots", "public-monitoring"] as const,
  reason:
    "Every major platform forbids automated access outside its API; the ones without an API (Jiji, Nairaland, Marketplace) enforce it with bans. Automation would put the customer's account at risk, not just ours.",
};

export function channelById(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}

export function channelsByWave(wave: Channel["wave"]): Channel[] {
  return CHANNELS.filter((c) => c.wave === wave);
}

/** Build order, then cheapest effort first. */
export function buildOrder(): Channel[] {
  const effortRank: Record<Channel["effort"], number> = { S: 0, M: 1, L: 2 };
  return [...CHANNELS].sort(
    (a, b) => a.wave - b.wave || effortRank[a.effort] - effortRank[b.effort]
  );
}

export function catalogStats() {
  return {
    total: CHANNELS.length,
    officialWrite: OFFICIAL_WRITE_CHANNELS.length,
    assisted: ASSISTED_CHANNELS.length,
    freeRead: CHANNELS.filter((c) => c.api.read && c.api.cost === "free").length,
    playwrightPosting: CHANNELS.filter(
      (c) => c.automation.playwrightVerdict === "assisted-only"
    ).length,
  };
}

// ============================================================================
// Runtime contract — what "our own API" actually looks like
// ============================================================================

export interface ConnectionRef {
  id: string;
  channelId: string;
  organizationId: string;
  /** Opaque reference to the vault entry; never the raw token. */
  credentialRef: string;
  scopes: string[];
  expiresAt: string | null;
}

export interface DateRange {
  since: string;
  until: string;
}

export interface MetricRow {
  channelId: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface CampaignDraft {
  name: string;
  objective: "awareness" | "traffic" | "leads" | "conversions";
  dailyBudget: number;
  currency: "NGN";
  headline: string;
  body: string;
  destinationUrl: string;
  creativeUrls: string[];
}

export interface PublishResult {
  status: "published" | "queued" | "needs-human";
  externalId?: string;
  /** Present for assisted channels: open this and let the owner publish. */
  assistedUrl?: string;
  message?: string;
}

/**
 * Every connector implements the same four operations. `push` on an assisted
 * channel never pretends to publish: it returns `needs-human` plus a deep link.
 */
export interface ChannelAdapter {
  readonly channel: Channel;
  connect(input: {
    organizationId: string;
    authorizationCode: string;
    redirectUri: string;
  }): Promise<ConnectionRef>;
  pull(connection: ConnectionRef, range: DateRange): Promise<MetricRow[]>;
  push(
    connection: ConnectionRef | null,
    draft: CampaignDraft
  ): Promise<PublishResult>;
  /** Assisted fallback used when write is "assisted" or "none". */
  assistedLaunch(draft: CampaignDraft): PublishResult;
}

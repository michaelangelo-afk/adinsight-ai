// lib/influencer/compare-to-ads.ts
//
// Phase 4 — helper to surface "your ads" ROI vs creator CPM in one
// chart. Pure functions; consumes DashboardSummary shape from
// lib/types.ts (Phase 3) and ExtendedInfluencer (Phase 4) so we don't
// share state. Used by the bubble chart panel
// (components/influencer/bubble-compare-chart.tsx).

import type { DashboardSummary, CampaignSummary } from "@/lib/types";
import type { ExtendedInfluencer } from "./types";

/**
 * Average cost-per-impression (₦) for the brand across all its ad
 * campaigns in the prototype. Solved as
 *   impressions / spend across all campaigns, then inverted so we get
 *   an "average ad-reach-per-₦" multiplier that scales to a million.
 *
 * Clamped at a sane floor so a single outlier campaign doesn't push
 * the comparison into "ads look free" territory. Floor 6000 reach/₦
 * (= ₦167/1k reach) is realistic for Nigerian CPMs in 2026.
 */
export function averageAdReachPerNaira(
  campaigns: CampaignSummary[]
): number {
  let totalSpend = 0;
  let totalImpressions = 0;
  for (const c of campaigns) {
    totalSpend += c.spend;
    totalImpressions += c.impressions;
  }
  if (totalSpend === 0) return 6_000;
  const ratio = totalImpressions / totalSpend;
  return Math.max(2_000, ratio);
}

/**
 * Avg cost-per-1k-reach on the brand's current ads (₦ per 1,000 reach).
 * Mirror of `creatorCpmByFollower` so a head-to-head bubble chart
 * compares apples-to-apples.
 */
export function averageAdCpmBy1000Reach(campaigns: CampaignSummary[]): number {
  const reachPerNaira = averageAdReachPerNaira(campaigns);
  return Math.round(1_000 / reachPerNaira * 100) / 100;
}

/**
 * Headroom: how many extra reach-impressions would a creator bring
 * per ₦1k spend compared to the brand's existing channel?
 * Returned as a 0..4 number; 1.0 = parity, 1.6 = 60% more reach per ₦.
 */
export function creatorVsAdLift(
  c: ExtendedInfluencer,
  baselineCpm: number
): number {
  if (baselineCpm === 0) return 1;
  const creatorCpm = c.cpmByFollower / c.engagementRate; // rough reach proxy
  // If creatorCpm < baselineCpm → creator costs LESS per reach → lift > 1.
  return Math.max(0.25, Math.min(4, baselineCpm / creatorCpm));
}

/**
 * Projected total reach (≈ engaged followers × multiplier) for a
 * single one-shot deal at a given budget. Used by the ROI calculator
 * inside the creator detail drawer.
 */
export function projectedReach(
  c: ExtendedInfluencer,
  budget: number
): number {
  if (c.basePrice === 0) return 0;
  const slots = Math.floor(budget / c.basePrice);
  const er = c.engagementRate;
  // Each slot reaches ~65% of followerCount (overlap deduplicated).
  return Math.round(slots * c.followerCount * 0.65 * er * 4);
}

/**
 * Total commercial value of one audience: convert projected reach
 * into a ₦ estimate using a static CPM of ₦1200 (typical Nigerian
 * display CPM on Meta in 2026). Informational only.
 */
export function projectedMediaValue(
  c: ExtendedInfluencer,
  budget: number,
  cpmNaira = 1200
): number {
  const reach = projectedReach(c, budget);
  return Math.round((reach / 1000) * cpmNaira);
}

/**
 * Marketplace-level aggregate stats for the hero KPIs. Pure function
 * so the server can compute without a dedicated action.
 */
export interface MarketplaceStats {
  totalCreators: number;
  averageFit: number;
  /** Total followers across all listed creators. */
  totalReach: number;
  /** Average cost-per-1k-followers across all listed creators. */
  averageCpmBy1000Followers: number;
  /** Average engagement rate. */
  averageEngagementRate: number;
  /** Creators with fit ≥ 70. */
  highFitCount: number;
}

export function marketplaceStats(
  creators: ExtendedInfluencer[],
  selectFit: (creator: ExtendedInfluencer) => number
): MarketplaceStats {
  const total = creators.length;
  if (total === 0) {
    return {
      totalCreators: 0,
      averageFit: 0,
      totalReach: 0,
      averageCpmBy1000Followers: 0,
      averageEngagementRate: 0,
      highFitCount: 0
    };
  }
  const totalReach = creators.reduce((s, c) => s + c.followerCount, 0);
  const sumFit = creators.reduce((s, c) => s + selectFit(c), 0);
  const sumEr = creators.reduce((s, c) => s + c.engagementRate, 0);
  // CPM-by-followers re-derived from raw followerCount + basePrice so
  // the aggregate behaves correctly even with edge-case rounding.
  const sumCpm = creators.reduce(
    (s, c) => s + ((c.basePrice / Math.max(1, c.followerCount)) * 1000),
    0
  );
  const highFit = creators.filter((c) => selectFit(c) >= 70).length;
  return {
    totalCreators: total,
    averageFit: Math.round(sumFit / total),
    totalReach,
    averageCpmBy1000Followers: Math.round(sumCpm / total),
    averageEngagementRate: sumEr / total,
    highFitCount: highFit
  };
}

/**
 * Helper that maps a marketplace stat into a 7-day sparkline (mocked,
 * deterministic from the integer aggregate itself). Avoids random for
 * SSR stability.
 */
export function sparkFromAggregate(value: number): number[] {
  const seed = Math.max(1, Math.round(value / 7));
  return [seed, seed * 1.1, seed * 0.95, seed * 1.18, seed * 1.05, seed * 1.22, seed * 1.12];
}

/**
 * Re-export the type so consumers can build a single import.
 */
export type { CampaignSummary, DashboardSummary };

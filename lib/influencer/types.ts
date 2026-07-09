// lib/influencer/types.ts
//
// Phase 4 — Influencer Sector domain types.
//
// Extends `types.ts::Influencer` (the minimal marketplace listing shape
// used by the landing "Influencer marketplace" feature) with the deeper
// analytics this module needs: audience demographics, post mix, ER
// history, audience-vs-brand overlap, and CPM normalisation.
//
// Determinism: every shape is plain data. Scoring helpers in
// `fit-score.ts` and `compare-to-ads.ts` consume these and NEVER throw
// — they're safe to call inside React Server Components.

import type { Influencer as BaseInfluencer } from "@/lib/types";

export type InfluencerPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter";

export type Niche =
  | "Food"
  | "Tech"
  | "Beauty"
  | "Fitness"
  | "Travel"
  | "Education"
  | "Career"
  | "Fashion"
  | "B2B"
  | "Lifestyle"
  | "Wellness";

export const ALL_NICHES: Niche[] = [
  "Food",
  "Tech",
  "Beauty",
  "Fitness",
  "Travel",
  "Education",
  "Career",
  "Fashion",
  "B2B",
  "Lifestyle",
  "Wellness"
];

export const ALL_CITIES = [
  "Lagos",
  "Abuja",
  "Ibadan",
  "Port Harcourt"
] as const;
export type City = (typeof ALL_CITIES)[number];

export const ALL_PLATFORMS: InfluencerPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter"
];

export type ContentKind = "reel" | "carousel" | "static" | "story" | "long";
export const ALL_CONTENT_KINDS: ContentKind[] = [
  "reel",
  "carousel",
  "static",
  "story",
  "long"
];

export const CONTENT_KIND_LABEL: Record<ContentKind, string> = {
  reel: "Reels",
  carousel: "Carousels",
  static: "Static",
  story: "Stories",
  long: "Long-form"
};

export type AgeBand = "13-17" | "18-24" | "25-34" | "35-44" | "45+";
export const AGE_BANDS: AgeBand[] = ["13-17", "18-24", "25-34", "35-44", "45+"];

export interface AudienceDemographics {
  /** Share (0..1) of followers in each age band. Sums to ~1. */
  ageBands: Record<AgeBand, number>;
  gender: { female: number; male: number; other: number };
  /** Top follower cities with share (0..1). Always ≥1 entry. */
  topCities: Array<{ city: City; share: number }>;
}

export interface ContentMixEntry {
  kind: ContentKind;
  /** Share 0..1. Sums to ~1. */
  share: number;
}

export interface SamplePost {
  id: string;
  kind: ContentKind;
  /** Mock thumbnail — emoji/symbol rendered; not a real network call. */
  thumbnailSeed: string;
  /** Engagement rate on this specific post. */
  er: number;
  /** ISO date the post went live. */
  postedAt: string;
}

export interface HistoricalEr {
  /** 12-month ER series (most recent last). 0..0.20 range typical. */
  series: number[];
  /** % change in ER vs the prior month. */
  delta: number;
}

export interface ExtendedInfluencer extends BaseInfluencer {
  audience: AudienceDemographics;
  contentMix: ContentMixEntry[];
  samplePosts: SamplePost[];
  historicalEr: HistoricalEr;
  /**
   * Niche interest signal of THIS influencer's audience — used to score
   * brand-vs-audience overlap. e.g. a B2B tech influencer may have
   * audience interest in [Tech, Career, Finance] which is great for a
   * SaaS brand but bad for a food client.
   */
  audienceNiche: Niche[];
  /** Cost per 1000 followers in NGN. Pre-computed for stable SSR. */
  cpmByFollower: number;
}

/**
 * Output of `computeFitScore`. Five orthogonal axes so we can render a
 * radar chart in the detail drawer AND a single composite number on
 * the discovery card.
 *
 *  audience     — audience-vs-brand-niche overlap (max 35 pts)
 *  niche        — creator-niche vs brand-niche adjacency (max 30 pts)
 *  budget       — does basePrice fit the brand's monthly budget band? (max 20 pts)
 *  geo          — city overlap with brand's HQ + target geos (max 10 pts)
 *  cadence      — recent ER momentum + posting cadence (max 5 pts)
 */
export interface FitBreakdown {
  overall: number; // 0..100
  byAxis: {
    audience: number; // 0..35
    niche: number; //    0..30
    budget: number; //   0..20
    geo: number; //      0..10
    cadence: number; //  0..5
  };
}

export type ShortlistEvent =
  | { type: "added"; id: string }
  | { type: "removed"; id: string };

export interface NicheOverlap {
  /** audience-side share (0..1) of the niche. */
  audienceShare: number;
  /** creator-side share (0..1) of the niche. */
  creatorShare: number;
  /** Geometric mean — used as "match strength". */
  match: number;
}

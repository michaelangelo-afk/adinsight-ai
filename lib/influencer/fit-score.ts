// lib/influencer/fit-score.ts
//
// Phase 4 — pure fit-score function. Deterministic, SSR-safe, no
// `Date.now()` / `Math.random()` — same input yields same score on the
// server and the first client render (no hydration shift).
//
// Brand defaults come from BRAND_NICHE_WEIGHTS / BRAND_GEO_WEIGHTS /
// BRAND_BUDGET_CAP exported from ./mock-data. The "Lagos Bites"
// restaurant is the prototype brand. Substituting weights lets us
// re-brand fit logic for any future tenant without touching this
// function.

import type { ExtendedInfluencer, FitBreakdown, Niche } from "./types";
import type { City } from "./types";
import {
  BRAND_BUDGET_CAP,
  BRAND_GEO_WEIGHTS,
  BRAND_NICHE_WEIGHTS
} from "./mock-data";

// ─── audience axis (max 35 pts) ──────────────────────────────────────
// "How much of THIS creator's audience self-identifies with the brand's
// niche?" — using the creator's `audienceNiche` field as the
// audience-side signal. We compute dot(audienceNicheShare,
// brandNicheWeight) bounded at 0..35.
function audienceAxis(c: ExtendedInfluencer): number {
  // Normalise `c.audienceNiche` to per-niche shares summing to ~1.
  const total = c.audienceNiche.length || 1;
  const audienceShare: Record<Niche, number> = Object.keys(
    BRAND_NICHE_WEIGHTS
  ).reduce(
    (acc, k) => ({ ...acc, [k]: 0 }),
    {} as Record<Niche, number>
  );
  for (const raw of c.audienceNiche) {
    const n = raw as Niche;
    if (n in audienceShare) audienceShare[n] += 1 / total;
  }
  let weighted = 0;
  for (const n of Object.keys(BRAND_NICHE_WEIGHTS) as Niche[]) {
    weighted += audienceShare[n] * (BRAND_NICHE_WEIGHTS[n] ?? 0);
  }
  // `weighted` is 0..1. Convert to 0..35. Brands whose audience is
  // 100% brand-niche earn full credit; mixed audiences earn partial.
  return Math.max(0, Math.min(35, weighted / 0.55 * 35));
}

// ─── niche axis (max 30 pts) ─────────────────────────────────────────
// "How close is THIS creator's stated niche to the brand's niche stack?"
// Tech + B2B = partial credit. Fashion + Beauty = high.
const NICHE_ADJACENCY: Record<Niche, Niche[]> = {
  Food: ["Lifestyle", "Wellness", "Travel"],
  Tech: ["B2B", "Education", "Career", "Lifestyle"],
  Beauty: ["Fashion", "Lifestyle", "Wellness"],
  Fitness: ["Wellness", "Lifestyle"],
  Travel: ["Lifestyle", "Food"],
  Education: ["B2B", "Tech", "Career"],
  Career: ["Education", "B2B", "Tech"],
  Fashion: ["Beauty", "Lifestyle"],
  B2B: ["Tech", "Education", "Career"],
  Lifestyle: ["Food", "Travel", "Wellness", "Beauty", "Fashion"],
  Wellness: ["Fitness", "Food", "Lifestyle", "Beauty"]
};

function nicheAxis(c: ExtendedInfluencer): number {
  let best = 0;
  const creatorNiches = c.niche as Niche[];
  for (const cn of creatorNiches) {
    const adj = NICHE_ADJACENCY[cn] ?? [];
    for (const bn of Object.keys(BRAND_NICHE_WEIGHTS) as Niche[]) {
      if (BRAND_NICHE_WEIGHTS[bn] === 0) continue;
      const w = BRAND_NICHE_WEIGHTS[bn] ?? 0;
      if (cn === bn) {
        best = Math.max(best, w * 30); // exact match, weighted by brand-pref
      } else if (adj.includes(bn)) {
        best = Math.max(best, w * 18); // adjacent, weighted by brand-pref
      } else if ((NICHE_ADJACENCY[bn] ?? []).includes(cn)) {
        best = Math.max(best, w * 12); // reverse-adjacent
      }
    }
  }
  return Math.max(0, Math.min(30, best));
}

// ─── budget axis (max 20 pts) ────────────────────────────────────────
// "Does the creator's basePrice fit the brand's per-creator cap?"
function budgetAxis(c: ExtendedInfluencer): number {
  const cap = BRAND_BUDGET_CAP;
  if (c.basePrice <= cap * 0.5) return 20;
  if (c.basePrice <= cap) return 16;
  if (c.basePrice <= cap * 1.4) return 8;
  if (c.basePrice <= cap * 2) return 3;
  return 0;
}

// ─── geo axis (max 10 pts) ───────────────────────────────────────────
// "Does the brand-geo stack resonate with the audience's topCities?"
function geoAxis(c: ExtendedInfluencer): number {
  let weighted = 0;
  for (const tc of c.audience.topCities) {
    const brandW = BRAND_GEO_WEIGHTS[tc.city as City] ?? 0;
    weighted += tc.share * brandW;
  }
  return Math.max(0, Math.min(10, weighted / 0.55 * 10));
}

// ─── cadence axis (max 5 pts) ────────────────────────────────────────
// "Is this creator trending up or down?" — uses 12-month ER delta.
function cadenceAxis(c: ExtendedInfluencer): number {
  const d = c.historicalEr.delta;
  if (d >= 0.04) return 5;
  if (d >= 0.02) return 4;
  if (d >= 0) return 3;
  if (d >= -0.01) return 2;
  if (d >= -0.03) return 1;
  return 0;
}

/**
 * Compute the composite fit score for one creator against the default
 * brand. Pure, deterministic, SSR-safe.
 */
export function computeFitScore(c: ExtendedInfluencer): FitBreakdown {
  const byAxis = {
    audience: audienceAxis(c),
    niche: nicheAxis(c),
    budget: budgetAxis(c),
    geo: geoAxis(c),
    cadence: cadenceAxis(c)
  };
  const overall = Math.round(
    byAxis.audience + byAxis.niche + byAxis.budget + byAxis.geo + byAxis.cadence
  );
  return { overall: Math.max(0, Math.min(100, overall)), byAxis };
}

/**
 * Convenience: pull a single 0..100 score for use in lists, sorting,
 * and labels. Equivalent to `computeFitScore(c).overall`.
 */
export function shortFitScore(c: ExtendedInfluencer): number {
  return computeFitScore(c).overall;
}

/**
 * Sort+map a list of creators → `{ creator, fit }` for marketplace
 * rendering. Pairs well with the bento grid (sorts by fit desc).
 */
export function withFitScores(
  creators: ExtendedInfluencer[]
): Array<{ creator: ExtendedInfluencer; fit: FitBreakdown }> {
  return creators
    .map((creator) => ({ creator, fit: computeFitScore(creator) }))
    .sort((a, b) => b.fit.overall - a.fit.overall);
}

/**
 * "Quality quadrant" label for creators on the cost-vs-reach scatter
 * chart. Affordability vs. expected impact (ER × followerCount) →
 * strings for tooltip labels.
 */
export type CreatorQuadrant =
  | "sweet-spot"
  | "premium-overperform"
  | "premium-underperform"
  | "budget-gem"
  | "low-priority";

export function creatorQuadrant(
  c: ExtendedInfluencer,
  fit: FitBreakdown
): CreatorQuadrant {
  const affordability = c.basePrice <= BRAND_BUDGET_CAP ? "good" : "premium";
  const impact = c.engagementRate * c.followerCount >= 2_000 ? "high" : "low";
  if (affordability === "good" && impact === "high" && fit.overall >= 70)
    return "sweet-spot";
  if (affordability === "good" && (impact === "high" || fit.overall >= 65))
    return "budget-gem";
  if (affordability === "premium" && impact === "high") return "premium-overperform";
  if (affordability === "premium" && impact === "low") return "premium-underperform";
  return "low-priority";
}

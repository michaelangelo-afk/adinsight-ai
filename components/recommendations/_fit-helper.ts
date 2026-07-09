// components/recommendations/_fit-helper.ts
//
// Tiny utility mapping recommendation impact → a synthetic 0..100
// score, so the FitScoreRing can be reused in the recommendation
// drawer (same visual language as the creator scoring). Keeps the
// component file lean.

import type { Recommendation } from "@/lib/types";

const BASELINE_BY_IMPACT = { high: 92, medium: 78, low: 61 } as const;

export function computeSyntheticFit(r: Recommendation): number {
  // Status-aware overlay: dismissed ones lose confidence signal
  // (since they didn't survive review). Each pending/apply-nudge
  // gets a small fresh boost.
  const base = BASELINE_BY_IMPACT[r.impact];
  if (r.status === "dismissed") return Math.max(0, base - 30);
  if (r.status === "applied") return Math.min(100, base + 5);
  return base;
}

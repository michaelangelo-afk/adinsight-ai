// components/recommendations/recommendations-bento.tsx
//
// Server Component wrapper around RecommendationCard. Composes the
// bento layout: the highest-impact pending recommendation occupies
// the featured slot (spans 2-cols on lg+); the rest stagger 60ms
// each.

import { Sparkles } from "lucide-react";
import { RecommendationCard } from "./recommendation-card";
import type { ImpactLevel, Recommendation } from "@/lib/types";

const IMPACT_WEIGHT: Record<ImpactLevel, number> = {
  high: 3,
  medium: 2,
  low: 1
};

export function RecommendationsBento({
  recommendations,
  campaignNameById,
  emptyHint
}: {
  recommendations: Recommendation[];
  /** Optional lookup so anchored recs can show the campaign name. */
  campaignNameById?: Record<string, string>;
  emptyHint?: string;
}) {
  if (recommendations.length === 0) {
    return (
      <div
        className="glass-card rounded-2xl p-12 text-center animate-fade-up"
        role="status"
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-300 mb-4">
          <Sparkles size={20} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-mist-50">
          No recommendations in this view.
        </h3>
        <p className="mt-2 text-sm text-mist-300 max-w-md mx-auto">
          {emptyHint ??
            "Try clearing the status filter — your AI queue runs every 6 hours."}
        </p>
      </div>
    );
  }

  // Featured: pending high-impact first; if none pending, just the
  // highest-impact rec.
  const sorted = [...recommendations].sort((a, b) => {
    const statusBoost = a.status === "pending" ? 1 : 0;
    const statusBoostB = b.status === "pending" ? 1 : 0;
    return (
      IMPACT_WEIGHT[b.impact] + statusBoostB -
      (IMPACT_WEIGHT[a.impact] + statusBoost)
    );
  });
  const [featured, ...rest] = sorted;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <RecommendationCard
          recommendation={featured}
          campaignName={
            featured.campaignId
              ? campaignNameById?.[featured.campaignId]
              : undefined
          }
          variant="featured"
          delay={0}
        />
      </div>
      {rest.map((r, i) => (
        <RecommendationCard
          key={r.id}
          recommendation={r}
          campaignName={
            r.campaignId ? campaignNameById?.[r.campaignId] : undefined
          }
          variant="standard"
          delay={(i + 1) * 60}
        />
      ))}
    </div>
  );
}

// components/influencer/creator-grid.tsx
//
// Server Component. Composes the bento grid:
//  - First creator in the filtered list is the "featured" variant
//    (spans 2-cols on lg+, shows historical ER sparkline).
//  - All others are standard variants with a 60ms stagger.
//
// No filter state — that's the parent's responsibility. We just render.
// Filtering data flows in via the `creators` prop.

import { CreatorCard } from "./creator-card";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import type { FitBreakdown } from "@/lib/influencer/types";
import { Sparkles } from "lucide-react";

export interface CreatorGridItem {
  creator: ExtendedInfluencer;
  fit: FitBreakdown;
}

export function CreatorGrid({
  items,
  emptyHint
}: {
  items: CreatorGridItem[];
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className="glass-card rounded-2xl p-12 text-center animate-fade-up"
        role="status"
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-300 mb-4">
          <Sparkles size={20} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-mist-50">
          No creators match your filters.
        </h3>
        <p className="mt-2 text-sm text-mist-300 max-w-md mx-auto">
          {emptyHint ??
            "Try broadening your niche selection or clearing the price filter to expand results."}
        </p>
      </div>
    );
  }

  const [featured, ...rest] = items;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Featured: spans both columns on lg+ */}
      <div className="lg:col-span-2">
        <CreatorCard
          creator={featured.creator}
          fit={featured.fit}
          variant="featured"
          delay={0}
        />
      </div>

      {rest.map((it, i) => (
        <CreatorCard
          key={it.creator.id}
          creator={it.creator}
          fit={it.fit}
          variant="standard"
          delay={(i + 1) * 60}
        />
      ))}
    </div>
  );
}

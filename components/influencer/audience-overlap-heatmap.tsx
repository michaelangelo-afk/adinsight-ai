// components/influencer/audience-overlap-heatmap.tsx
//
// Server Component. Two-dimensional heatmap: rows = creators, columns
// = brand-relevant niches. Cell intensity is the audience-side share of
// that niche inside the creator's audience (audienceNiche share, then
// potential boost if the creator themselves makes that niche).
//
// Pure CSS grid (no Recharts); determinism is straightforward. Tooltip
// is rendered as a CSS peer-hover popover for the cell descriptor —
// matches the "no JS for content reveal" rule from the ui-ux-pro-max
// Quick Reference (entities that can ship as CSS should ship as CSS).

import { HEATMAP_NICHES, BRAND_NICHE_WEIGHTS } from "@/lib/influencer/mock-data";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import { formatCompactNumber } from "@/lib/utils";
import { Info } from "lucide-react";

interface Row {
  creator: ExtendedInfluencer;
  // Map< niche, intensity 0..1 >
  intensities: Record<string, number>;
}

function intensityFor(creator: ExtendedInfluencer, niche: string): number {
  // Audience share: 1 base unit per appearance in audienceNiche,
  // normalised by the audienceNiche length.
  const audTotal = creator.audienceNiche.length || 1;
  const audShare =
    creator.audienceNiche.filter((n) => n === niche).length / audTotal;
  // Creator-niche boost: 1.0 if it's a creator's stated niche,
  // 0 otherwise.
  const creatorShare =
    creator.niche.filter((n) => n === niche).length > 0 ? 1 : 0;
  // Combined intensity: weighted average leaning audience, since
  // audience-overlap is what matters for ad ROI.
  const combined = audShare * 0.7 + creatorShare * 0.3;
  // Brand-emphasis boost: niches that matter to the brand get +15%
  // intensity to nudge them visually.
  const brandBoost = (BRAND_NICHE_WEIGHTS[niche as keyof typeof BRAND_NICHE_WEIGHTS] ?? 0) * 0.15;
  return Math.min(1, combined + brandBoost);
}

function intensityToBg(intensity: number): string {
  // 0 → rgba(148,163,184,0.05); 1 → rgba(16,185,129,0.85)
  const a = 0.05 + intensity * 0.8;
  return `rgba(16,185,129,${a.toFixed(3)})`;
}

function intensityToTextColor(intensity: number): string {
  return intensity >= 0.55 ? "rgba(7,7,16,0.95)" : "rgba(244,244,255,0.85)";
}

export function AudienceOverlapHeatmap({
  creators
}: {
  creators: ExtendedInfluencer[];
}) {
  const rows: Row[] = creators.map((creator) => {
    const intensities: Record<string, number> = {};
    for (const n of HEATMAP_NICHES) {
      intensities[n] = intensityFor(creator, n);
    }
    return { creator, intensities };
  });

  return (
    <div
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "180ms" }}
      role="figure"
      aria-label="Audience niche overlap by creator"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-mist-600 dark:text-mist-400 inline-flex items-center gap-1.5">
            <Info size={11} aria-hidden className="text-violet-300" />
            Audience overlap
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            Where each creator's audience actually lives
          </h3>
          <p className="mt-1 text-sm text-mist-600 dark:text-mist-300">
            Darker cells = stronger audience match with that niche. Brand
            niches (Food, Lifestyle, Wellness) are weighted slightly higher.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6">
        <div
          className="grid min-w-[680px] gap-[2px] hairline rounded-lg p-2"
          style={{
            gridTemplateColumns: `220px repeat(${HEATMAP_NICHES.length}, minmax(64px, 1fr))`
          }}
        >
          {/* Header row */}
          <div className="px-2 py-2 text-[11px] uppercase tracking-wider text-mist-500 sticky left-0 bg-ink-950/50 backdrop-blur">
            Creator
          </div>
          {HEATMAP_NICHES.map((n) => {
            const emphasised = (BRAND_NICHE_WEIGHTS[n] ?? 0) > 0;
            return (
              <div
                key={n}
                className={
                  "text-center text-[10px] uppercase tracking-wider px-1 py-2 " +
                  (emphasised
                    ? "text-emerald-300 font-semibold"
                    : "text-mist-500")
                }
                title={emphasised ? "Brand-priority niche" : n}
              >
                {n.slice(0, 4)}
              </div>
            );
          })}

          {rows.map(({ creator, intensities }, rowIdx) => (
            <div key={creator.id} className="contents">
              <div
                className="px-2 py-2 sticky left-0 bg-ink-950/50 backdrop-blur z-[1] min-w-0"
              >
                <div className="text-xs font-semibold text-mist-50 truncate">
                  {creator.fullName}
                </div>
                <div className="text-[10px] text-mist-500 truncate">
                  {creator.handle}
                </div>
              </div>
              {HEATMAP_NICHES.map((n) => {
                const v = intensities[n] ?? 0;
                return (
                  <div
                    key={`${creator.id}-${n}`}
                    className="relative h-12 rounded-md flex items-center justify-center group/cell cursor-default animate-fade-up"
                    style={{
                      background: intensityToBg(v),
                      color: intensityToTextColor(v),
                      animationDelay: `${rowIdx * 30}ms`
                    }}
                    title={`${creator.fullName} × ${n}: ${(v * 100).toFixed(0)}% audience overlap`}
                  >
                    <span className="text-[10px] tabular-nums font-semibold">
                      {v >= 0.05 ? `${Math.round(v * 100)}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-mist-500">
        <span>Reach scale:</span>
        <div className="flex items-center gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <span
              key={v}
              aria-hidden
              className="h-3 w-6 rounded-sm"
              style={{ background: intensityToBg(v) }}
            />
          ))}
        </div>
        <span>0% → 100% audience overlap</span>
        <span className="ml-auto text-mist-400">
          Headline reachable via shortlist:{" "}
          <strong className="text-mist-50 tabular-nums">
            {formatCompactNumber(
              creators.reduce((s, c) => s + c.followerCount, 0)
            )}
          </strong>
        </span>
      </div>
    </div>
  );
}

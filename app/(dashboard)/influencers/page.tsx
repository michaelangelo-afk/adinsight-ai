// app/(dashboard)/influencers/page.tsx
//
// Phase 4 — Influencer Sector.
//
// Sibling route to `/dashboard` so it shares the same `(dashboard)`
// route-group layout (auth-gating + Sidebar). The page itself is a
// server component that does:
//
//  1. Read filters from `searchParams` (URL is source of truth so the
//     page is fully shareable).
//  2. Filter + sort `extendedInfluencers`.
//  3. Compute per-creator fit-scores + marketplace aggregate stats.
//  4. Compose all 7 motion zones + the drawer trigger.
//
// The only client zone that touches URL is the drawer: it reads
// `?c=<id>` and uses Next's router.replace(...) to close — keeping
// the source of truth identical across server and client renders.

import { Suspense } from "react";
import { Sparkles, ArrowDownRight, UserRoundPlus } from "lucide-react";

import { Topbar } from "@/components/dashboard/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

import {
  extendedInfluencers,
  BRAND_NICHE_WEIGHTS
} from "@/lib/influencer/mock-data";
import {
  computeFitScore,
  withFitScores
} from "@/lib/influencer/fit-score";
import { marketplaceStats } from "@/lib/influencer/compare-to-ads";
import { campaigns } from "@/lib/mock-data";
import type { ExtendedInfluencer } from "@/lib/influencer/types";

import {
  FilterBar
} from "@/components/influencer/filter-bar";
import {
  MarketplaceKpis
} from "@/components/influencer/marketplace-kpis";
import {
  CreatorGrid
} from "@/components/influencer/creator-grid";
import {
  BubbleCompareChart
} from "@/components/influencer/bubble-compare-chart";
import {
  AudienceOverlapHeatmap
} from "@/components/influencer/audience-overlap-heatmap";
import {
  ShortlistPanel
} from "@/components/influencer/shortlist-panel";
import {
  CreatorDetailDrawer
} from "@/components/influencer/creator-detail-drawer";

interface SP {
  q?: string;
  niche?: string;
  city?: string;
  platform?: string;
  price?: string;
  sort?: string;
  c?: string;
}

function parseList(raw: string | undefined): string[] {
  return (raw?.split(",").map((s) => s.trim()).filter(Boolean) ?? []);
}

function matches(
  c: ExtendedInfluencer,
  q: string,
  niches: string[],
  cities: string[],
  platforms: string[],
  priceLo: number,
  priceHi: number
): boolean {
  if (q.length > 0) {
    const haystack = [
      c.fullName,
      c.handle,
      c.city,
      ...c.niche,
      ...c.audienceNiche
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  if (niches.length && !c.niche.some((n) => niches.includes(n))) return false;
  if (cities.length && !cities.includes(c.city)) return false;
  if (platforms.length && !c.platforms.some((p) => platforms.includes(p)))
    return false;
  if (c.basePrice < priceLo || c.basePrice > priceHi) return false;
  return true;
}

function applySort(
  arr: Array<{ creator: ExtendedInfluencer; fit: ReturnType<typeof computeFitScore> }>,
  sort: string
): typeof arr {
  const sorted = arr.slice();
  switch (sort) {
    case "reach":
      sorted.sort(
        (a, b) => b.creator.followerCount - a.creator.followerCount
      );
      break;
    case "er":
      sorted.sort(
        (a, b) => b.creator.engagementRate - a.creator.engagementRate
      );
      break;
    case "price-asc":
      sorted.sort((a, b) => a.creator.basePrice - b.creator.basePrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.creator.basePrice - a.creator.basePrice);
      break;
    case "momentum":
      sorted.sort(
        (a, b) => b.creator.recentDelta - a.creator.recentDelta
      );
      break;
    case "fit":
    default:
      sorted.sort((a, b) => b.fit.overall - a.fit.overall);
      break;
  }
  return sorted;
}

function parsePriceRange(raw: string | undefined): [number, number] {
  if (!raw) return [0, 500_000];
  const [lo, hi] = raw.split("-").map((n) => Number(n));
  if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) return [lo, hi];
  return [0, 500_000];
}

export default async function InfluencersPage({
  searchParams
}: {
  searchParams: SP;
}) {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);

  const q = (searchParams.q ?? "").trim();
  const niches = parseList(searchParams.niche);
  const cities = parseList(searchParams.city);
  const platforms = parseList(searchParams.platform);
  const [priceLo, priceHi] = parsePriceRange(searchParams.price);
  const sort = searchParams.sort ?? "fit";

  // 1. Compute fit for everyone (so marketplace stats don't change with filter),
  //    then filter the marketplace list, then re-sort.
  const allFits = withFitScores(extendedInfluencers);
  const fitsRecord = allFits.reduce<Record<string, ReturnType<typeof computeFitScore>>>(
    (acc, it) => {
      acc[it.creator.id] = it.fit;
      return acc;
    },
    {}
  );

  const filtered = allFits
    .filter((it) =>
      matches(
        it.creator,
        q,
        niches,
        cities,
        platforms,
        priceLo,
        priceHi
      )
    )
    .map((it) => ({ creator: it.creator, fit: it.fit }));
  const sorted = applySort(filtered, sort);

  // Stats use the un-filtered cohort so users always see honest total.
  const stats = marketplaceStats(
    extendedInfluencers,
    (c) => fitsRecord[c.id]?.overall ?? 0
  );

  const profile = {
    avatar:
      user?.profile?.avatar ||
      (user?.profile?.full_name ?? "User")
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "?",
    fullName: user?.profile?.full_name ?? "User",
    businessName: orgName
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />

      <main className="flex-1 space-y-4 px-4 py-6 md:px-6 lg:px-8">
        <PageHeader
          eyebrow={
            <>
              <Sparkles size={11} aria-hidden className="text-brand-300" />
              Creator marketplace
            </>
          }
          title="Influencers"
          description={
            <>
              {extendedInfluencers.length} vetted creators across Lagos, Abuja,
              Ibadan and Port Harcourt, ranked by audience overlap with your
              brand. Brief the ones already winning over your future customers.
            </>
          }
          actions={
            <>
              <a
                href="#marketplace-kpis"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.02] px-2.5 text-[11.5px] font-medium text-mist-200 transition-colors hover:border-white/[0.18] hover:text-white"
              >
                <ArrowDownRight size={12} aria-hidden />
                Marketplace stats
              </a>
              <a
                href="/influencers?c=inf_01"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-500"
              >
                <UserRoundPlus size={12} aria-hidden />
                Top match
              </a>
            </>
          }
        />

        {/* Z2: Filter bar */}
        <Suspense fallback={null}>
          <FilterBar totalCount={sorted.length} />
        </Suspense>

        {/* Z3: Marketplace KPIs */}
        <div id="marketplace-kpis">
          <MarketplaceKpis stats={stats} />
        </div>

        {/* Z4 + Z5 + Z6: grid + heatmap + compare */}
        <CreatorGrid items={sorted} emptyHint="Try clearing the price slider or some niche pills to see more creators." />

        <BubbleCompareChart
          creators={sorted.slice(0, 12).map((it) => it.creator)}
          fits={fitsRecord}
          campaigns={campaigns}
        />

        <AudienceOverlapHeatmap
          creators={sorted.slice(0, 12).map((it) => it.creator)}
        />

        {/* Z7: Shortlist */}
        <ShortlistPanel
          creators={extendedInfluencers}
          fits={fitsRecord}
        />
      </main>

      {/* Global drawer trigger — reads ?c= from URL */}
      <Suspense fallback={null}>
        <CreatorDetailDrawer
          creators={extendedInfluencers}
          fits={fitsRecord}
        />
      </Suspense>

      {/* Brand weights summary footer */}
      <footer className="px-4 pb-6 text-[11px] text-mist-500 md:px-6 lg:px-8">
        Fit is computed against your brand weights
        (Food {Math.round((BRAND_NICHE_WEIGHTS.Food ?? 0) * 100)}%,
        Lifestyle {Math.round((BRAND_NICHE_WEIGHTS.Lifestyle ?? 0) * 100)}%,
        Wellness {Math.round((BRAND_NICHE_WEIGHTS.Wellness ?? 0) * 100)}%)
        with a ₦{(200_000).toLocaleString()}/creator budget cap. Tune in
        onboarding for a different vertical.
      </footer>
    </div>
  );
}


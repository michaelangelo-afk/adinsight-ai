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
import {
  Sparkles,
  Plus,
  ArrowDownRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedLogo } from "@/components/motion/animated-logo";
import { MagneticCTA } from "@/components/motion/magnetic-cta";
import { AuroraOrbsBackground } from "@/components/motion/aurora-orbs-background";
import { TextureGrain } from "@/components/motion/texture-grain";

import { Topbar } from "@/components/dashboard/topbar";
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
import {
  marketplaceStats,
  averageAdCpmBy1000Reach
} from "@/lib/influencer/compare-to-ads";
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

  const baselineCpm = averageAdCpmBy1000Reach(campaigns);

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
    <div className="relative flex-1 min-w-0 flex flex-col">
      {/* Subtle alive background — orbs + grain — clipped to this page
          (NOT the whole dashboard shell, so one page being "alive" doesn't
          bleed into `/dashboard`). bg-emerald-600/15 wash tinting
          distinguishes the sector visually too. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <AuroraOrbsBackground variant="dark" />
        <TextureGrain />
      </div>

      <Topbar profile={profile} />

      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Z1: Hero */}
        <section
          className="relative rounded-3xl overflow-hidden hairline bg-gradient-to-br from-violet-700/15 via-ink-950/60 to-emerald-500/10 p-6 sm:p-8 animate-fade-up"
          aria-label="Influencer sector hero"
        >
          <div
            aria-hidden
            className="absolute inset-0 grid-bg opacity-40"
          />
          <div className="relative grid lg:grid-cols-[1.5fr,1fr] gap-6 items-center">
            <div>
              <Badge tone="violet" className="!text-[10px]">
                <Sparkles size={11} aria-hidden />
                Phase 4 · Influencer sector
              </Badge>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-mist-50 leading-[1.05]">
                Find{" "}
                <span className="gradient-text">
                  creators your audience already trusts.
                </span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-mist-200 max-w-xl leading-relaxed">
                Vet 12 vetted creators across Lagos, Abuja, Ibadan and Port
                Harcourt — ranked by audience-overlap momentum with your
                brand. Skip the cold outreach and brief the ones already
                winning over your future customers.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <MagneticCTA>
                  <a
                    href="#marketplace-kpis"
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-700 hover:bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold shadow-glow-emerald hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.55)] tap-press touch-target"
                    aria-label="Jump to discovery KPIs"
                  >
                    <ArrowDownRight size={14} aria-hidden />
                    Explore the marketplace
                  </a>
                </MagneticCTA>
                <a
                  href="/influencers?c=inf_01"
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold tap-press bg-white/5 text-mist-200 border border-mist-50/10 hover:text-mist-50 hover:border-emerald-500/40 touch-target"
                >
                  <Plus size={14} aria-hidden />
                  See the top match
                </a>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 max-w-md text-[11px] text-mist-400">
                <MiniStat label="Avg fit" value={`${stats.averageFit}/100`} />
                <MiniStat
                  label="Total reach"
                  value={`${(stats.totalReach / 1000).toFixed(0)}k`}
                />
                <MiniStat
                  label="vs Meta CPM"
                  value={`−${Math.round((1 - stats.averageCpmBy1000Followers / baselineCpm) * 100)}%`}
                  highlight
                />
              </div>
            </div>

            <div className="hidden lg:flex justify-center items-center">
              <div className="relative h-48 w-48">
                <AnimatedLogo aria-hidden />
                <span
                  aria-hidden
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                  Live · 12 vetted creators
                </span>
              </div>
            </div>
          </div>
        </section>

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
      <footer className="px-6 md:px-8 pb-6 text-[11px] text-mist-500">
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

function MiniStat({
  label,
  value,
  highlight
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-mist-50/[0.04] hairline px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-mist-500">
        {label}
      </div>
      <div
        className={
          "text-sm font-semibold tabular-nums " +
          (highlight ? "text-emerald-300" : "text-mist-50")
        }
      >
        {value}
      </div>
    </div>
  );
}

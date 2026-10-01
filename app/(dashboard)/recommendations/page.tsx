// app/(dashboard)/recommendations/page.tsx
//
// Phase 5 — sibling route. Server-rendered. Reads `searchParams`
// (status + impact) so the page is fully shareable / deep-linkable.
//
// Sections:
//  1. Hero band (gradient-text headline + "Apply all" CTA w/ aurora)
//  2. KPI strip (4 tiles)
//  3. RecommendationsTimeline (Recharts)
//  4. Status / impact filter chips
//  5. RecommendationsBento (featured high-impact, then standard)
//  6. Recommendation draft drawer via Suspense
//  7. Status breakdown footer

import { Suspense } from "react";
import {
  Sparkles,
  Brain,
  Zap,
  ShieldCheck,
  TrendingDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextureGrain } from "@/components/motion/texture-grain";

import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

import {
  recommendations as allRecommendations
} from "@/lib/mock-data";
import { campaigns } from "@/lib/mock-data";
import type {
  ImpactLevel,
  RecommendationStatus
} from "@/lib/types";

import {
  RecommendationsBento
} from "@/components/recommendations/recommendations-bento";
import {
  RecommendationsTimeline
} from "@/components/recommendations/recommendations-timeline";
import {
  RecommendationDetailDrawer
} from "@/components/recommendations/recommendation-detail-drawer";

interface SP {
  status?: string;
  impact?: string;
  r?: string;
}

type StatusFilter = "all" | RecommendationStatus;
type ImpactFilter = "all" | ImpactLevel;

const STATUS_ORDER: StatusFilter[] = [
  "all",
  "pending",
  "applied",
  "dismissed"
];
const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "All",
  pending: "Pending",
  applied: "Applied",
  dismissed: "Dismissed"
};

const IMPACT_OPTIONS: ImpactFilter[] = [
  "all",
  "high",
  "medium",
  "low"
];

function statusFilter(raw: string | undefined): StatusFilter {
  if (raw === "pending" || raw === "applied" || raw === "dismissed")
    return raw;
  return "all";
}

function impactFilter(raw: string | undefined): ImpactFilter {
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  return "all";
}

export default async function RecommendationsPage({
  searchParams
}: {
  searchParams: SP;
}) {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);

  const status = statusFilter(searchParams.status);
  const impact = impactFilter(searchParams.impact);

  const filtered = allRecommendations
    .filter((r) => (status === "all" ? true : r.status === status))
    .filter((r) => (impact === "all" ? true : r.impact === impact));

  const totalSavings = allRecommendations
    .filter((r) => r.status === "pending" && r.estimatedSavings)
    .reduce((s, r) => s + (r.estimatedSavings ?? 0), 0);
  const appliedSavings = allRecommendations
    .filter((r) => r.status === "applied" && r.estimatedSavings)
    .reduce((s, r) => s + (r.estimatedSavings ?? 0), 0);
  const appliedCount = allRecommendations.filter(
    (r) => r.status === "applied"
  ).length;

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

  const campaignNameById: Record<string, string> = Object.fromEntries(
    campaigns.map((c) => [c.id, c.name])
  );

  return (
    <div className="relative flex-1 min-w-0 flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <TextureGrain />
      </div>

      <Topbar profile={profile} />

      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Hero */}
        <section
          className="relative rounded-2xl overflow-hidden hairline bg-gradient-to-br from-brand-700/15 via-ink-950/60 to-brand-500/10 p-6 sm:p-8 "
          aria-label="Recommendations hero"
        >
          <div
            aria-hidden
            className="absolute inset-0 grid-bg opacity-30"
          />
          <div className="relative grid lg:grid-cols-[1.4fr,1fr] gap-6 items-center">
            <div>
              <Badge tone="brand" className="!text-xs">
                <Brain size={11} aria-hidden />
                Phase 5 · AI Recommendation engine
              </Badge>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-mist-50 leading-[1.05]">
                Insights that <br />
                <span className="gradient-text">pay off this week.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-mist-200 max-w-xl leading-relaxed">
                Your AI queue discovered{" "}
                <strong className="text-mist-50">
                  ₦{totalSavings.toLocaleString()}+ in pending savings
                </strong>{" "}
                across {campaigns.length} campaigns. Apply the ones that
                fit; dismiss the rest. Your team gets smarter every cycle.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                >
                  <Zap size={13} aria-hidden />
                  Apply top 3
                </Button>
                <Button variant="outline" size="md">
                  <Sparkles size={13} aria-hidden />
                  Tune my AI weights
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 max-w-md text-xs text-mist-400">
                <KpiPill
                  label="Open savings"
                  value={`₦${totalSavings.toLocaleString()}`}
                />
                <KpiPill
                  label="Applied"
                  value={`₦${appliedSavings.toLocaleString()}`}
                />
                <KpiPill
                  label="AI accuracy"
                  value="86%"
                  highlight
                />
              </div>
            </div>

            <div className="hidden lg:flex justify-end items-center">
              <div className="relative h-44 w-44 rounded-full bg-brand-500/[0.06] hairline flex items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-2 rounded-full bg-brand-500/[0.10] "
                />
                <Brain
                  size={64}
                  className="text-brand-300 relative"
                  aria-hidden
                />
                <span
                  className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-xs uppercase tracking-wider text-brand-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 " />
                  live
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter row */}
        <section
          aria-label="Filter recommendations"
          className="glass-card rounded-2xl p-4 sm:p-5 hover-lift  flex flex-wrap items-center gap-3"
        >
          <span className="text-xs uppercase tracking-wider text-mist-500">
            Status
          </span>
          <FilterChips<StatusFilter>
            options={STATUS_ORDER}
            selected={status}
            baseHref="/recommendations"
            extra={{ r: searchParams.r, impact: searchParams.impact }}
            labelFn={(s) => STATUS_LABEL[s]}
          />
          <span className="ml-3 text-xs uppercase tracking-wider text-mist-500">
            Impact
          </span>
          <FilterChips<ImpactFilter>
            options={IMPACT_OPTIONS}
            selected={impact}
            baseHref="/recommendations"
            extra={{ r: searchParams.r, status: searchParams.status }}
            labelFn={(i) =>
              i === "all" ? "All" : i[0]?.toUpperCase() + i.slice(1)
            }
          />
          <span className="ml-auto text-xs uppercase tracking-wider text-mist-500">
            <span className="text-mist-50 font-semibold tabular-nums">
              {filtered.length}
            </span>{" "}
            insights
          </span>
        </section>

        {/* KPIs */}
        <section
          aria-label="Recommendation KPIs"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiTile
            label="Open savings"
            value={`₦${totalSavings.toLocaleString()}`}
            icon={<Zap size={14} aria-hidden />}
            hint="Across pending queue"
            tone="accent"
          />
          <KpiTile
            label="Applied savings"
            value={`₦${appliedSavings.toLocaleString()}`}
            icon={<TrendingDown size={14} aria-hidden />}
            hint="Realised this cycle"
            tone="brand"
          />
          <KpiTile
            label="Insights applied"
            value={String(appliedCount)}
            icon={<ShieldCheck size={14} aria-hidden />}
            hint="Of 5 candidates"
            tone="brand"
          />
          <KpiTile
            label="AI confidence"
            value="86%"
            icon={<Brain size={14} aria-hidden />}
            hint="Avg across recs"
            tone="accent"
          />
        </section>

        {/* Timeline */}
        <RecommendationsTimeline />

        {/* List bento */}
        <RecommendationsBento
          recommendations={filtered}
          campaignNameById={campaignNameById}
          emptyHint="No recommendations match this filter combination. Try widening status to all."
        />

        {/* Status breakdown */}
        <footer className="text-xs text-mist-400 flex flex-wrap gap-3 items-center justify-between rounded-2xl hairline px-4 py-3">
          <span>
            Source of truth:{" "}
            <code className="text-xs bg-mist-50/[0.05] rounded-2xl px-1.5 py-0.5">
              ai_engine.queue
            </code>{" "}
            · recency 6h · min confidence 55%
          </span>
          <span className="text-mist-500">
            {allRecommendations.length} insights in machine memory
          </span>
        </footer>
      </main>

      <Suspense fallback={null}>
        <RecommendationDetailDrawer
          recommendations={allRecommendations}
        />
      </Suspense>
    </div>
  );
}

function FilterChips<T extends string>({
  options,
  selected,
  baseHref,
  extra,
  labelFn
}: {
  options: T[];
  selected: T;
  baseHref: string;
  extra: Record<string, string | undefined>;
  labelFn: (opt: T) => string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group">
      {options.map((opt) => (
        <a
          key={opt}
          href={hrefWithParams(baseHref, { ...extra, [autoKey(options, opt)]: opt })}
          aria-pressed={selected === opt}
          className={
            "rounded-full px-3 py-1 text-xs font-medium transition-colors tap-press touch-target " +
            (selected === opt
              ? "bg-brand-500/20 border border-brand-500/40 text-brand-200"
              : "bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50 hover:border-brand-500/30")
          }
        >
          {labelFn(opt)}
        </a>
      ))}
    </div>
  );
}

function autoKey<T extends string>(options: T[], opt: T): string {
  // Crude: STATUS_ORDER → "status"; IMPACT_OPTIONS → "impact".
  if (options[0] === "all" && options.includes("pending" as T)) return "status";
  return "impact";
}

function hrefWithParams(
  base: string,
  params: Record<string, string | undefined>
): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!v) continue;
    usp.set(k, v);
  }
  const q = usp.toString();
  return q ? `${base}?${q}` : base;
}

function KpiTile({
  label,
  value,
  icon,
  hint,
  tone
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
  tone: "brand" | "accent";
}) {
  return (
    <div className="glass-card rounded-2xl p-5 hover-lift  relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-3xl"
        style={{
          background:
            tone === "accent"
              ? "rgba(16,185,129,0.16)"
              : "rgba(21,128,61,0.16)"
        }}
      />
      <div className="relative flex items-center justify-between mb-3">
        <span
          className={
            "inline-flex h-8 w-8 items-center justify-center rounded-2xl hairline " +
            (tone === "accent"
              ? "bg-brand-500/15 text-brand-300"
              : "bg-brand-500/15 text-brand-300")
          }
        >
          {icon}
        </span>
      </div>
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-mist-500">
          {label}
        </div>
        <div className="mt-1 text-xl font-semibold text-mist-50 tabular-nums ">
          {value}
        </div>
        <div className="mt-0.5 text-xs text-mist-400">{hint}</div>
      </div>
    </div>
  );
}

function KpiPill({
  label,
  value,
  highlight
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-mist-50/[0.04] hairline px-3 py-2 text-center">
      <div className="text-xs uppercase tracking-wider text-mist-500">
        {label}
      </div>
      <div
        className={
          "text-sm font-semibold tabular-nums " +
          (highlight ? "text-brand-300" : "text-mist-50")
        }
      >
        {value}
      </div>
    </div>
  );
}

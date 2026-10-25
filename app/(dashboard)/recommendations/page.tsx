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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";

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
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />

      <main className="flex-1 space-y-4 px-4 py-6 md:px-6 lg:px-8">
        <PageHeader
          eyebrow={
            <>
              <Sparkles size={11} aria-hidden className="text-brand-300" />
              AI recommendation engine
            </>
          }
          title="Recommendations"
          description={
            <>
              Your AI queue found{" "}
              <span className="font-medium text-mist-200">
                ₦{totalSavings.toLocaleString()} in pending savings
              </span>{" "}
              across {campaigns.length} campaigns. Apply what fits, dismiss the
              rest — the model retrains on every decision.
            </>
          }
          actions={
            <>
              <Button variant="outline" size="sm">
                <Sparkles size={12} aria-hidden />
                Tune weights
              </Button>
              <Button variant="primary" size="sm">
                <Zap size={12} aria-hidden />
                Apply top 3
              </Button>
            </>
          }
        />

        {/* Filter row */}
        <section
          aria-label="Filter recommendations"
          className="glass-card flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
        >
          <span className="stat-label">Status</span>
          <FilterChips<StatusFilter>
            options={STATUS_ORDER}
            selected={status}
            baseHref="/recommendations"
            extra={{ r: searchParams.r, impact: searchParams.impact }}
            labelFn={(s) => STATUS_LABEL[s]}
          />
          <span className="stat-label ml-3">Impact</span>
          <FilterChips<ImpactFilter>
            options={IMPACT_OPTIONS}
            selected={impact}
            baseHref="/recommendations"
            extra={{ r: searchParams.r, status: searchParams.status }}
            labelFn={(i) =>
              i === "all" ? "All" : i[0]?.toUpperCase() + i.slice(1)
            }
          />
          <span className="ml-auto text-[11px] text-mist-500">
            <span className="font-semibold tabular-nums text-mist-100">
              {filtered.length}
            </span>{" "}
            insights
          </span>
        </section>

        {/* KPIs */}
        <section
          aria-label="Recommendation KPIs"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <KpiTile
            label="Open savings"
            value={`₦${totalSavings.toLocaleString()}`}
            icon={<Zap size={12} aria-hidden />}
            hint="Across pending queue"
            tone="#34D399"
          />
          <KpiTile
            label="Applied savings"
            value={`₦${appliedSavings.toLocaleString()}`}
            icon={<TrendingDown size={12} aria-hidden />}
            hint="Realised this cycle"
            tone="#60A5FA"
          />
          <KpiTile
            label="Insights applied"
            value={String(appliedCount)}
            icon={<ShieldCheck size={12} aria-hidden />}
            hint="Of 5 candidates"
            tone="#A78BFA"
          />
          <KpiTile
            label="AI confidence"
            value="86%"
            icon={<Brain size={12} aria-hidden />}
            hint="Avg across recs"
            tone="#FBBF24"
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
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] px-4 py-3 text-[11px] text-mist-400">
          <span>
            Source of truth:{" "}
            <code className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] text-mist-300">
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
            "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors " +
            (selected === opt
              ? "border-brand-500/40 bg-brand-500/[0.14] text-brand-200"
              : "border-white/[0.08] bg-white/[0.02] text-mist-300 hover:border-white/[0.16] hover:text-mist-50")
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
  tone: string;
}) {
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="stat-label min-w-0">{label}</div>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `${tone}1f`,
            color: tone
          }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-1.5 truncate text-[17px] font-semibold tracking-tight text-mist-50 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-mist-500">{hint}</div>
    </Panel>
  );
}

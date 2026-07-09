// app/(dashboard)/reports/page.tsx
//
// Phase 5 — Reports route. Server-rendered.
//
// Sections:
//  1. Hero band
//  2. KPI strip (3 tiles: avg weekly performance, reports sent, recipients)
//  3. Featured + grid bento (report-card hero + standard rows)
//  4. SchedulePanel (cadence + recipients)
//  5. ReportPreviewSheet via Suspense

import { Suspense } from "react";
import {
  FileText,
  Calendar,
  Send,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuroraOrbsBackground } from "@/components/motion/aurora-orbs-background";
import { TextureGrain } from "@/components/motion/texture-grain";

import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

import { reports, dashboardSummary, campaigns } from "@/lib/mock-data";
import { formatNaira, formatCompactNumber } from "@/lib/utils";

import { ReportCard } from "@/components/reports/report-card";
import { SchedulePanel } from "@/components/reports/schedule-panel";
import { ReportPreviewSheet } from "@/components/reports/report-preview-sheet";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);

  const sortedReports = [...reports].sort(
    (a, b) => b.dateRangeEnd.localeCompare(a.dateRangeEnd)
  );
  const [featured, ...rest] = sortedReports;

  const avgWeeklySpend = Math.round(
    dashboardSummary.totalSpend / Math.max(1, sortedReports.length) / 2
  );
  const reportsSent = sortedReports.length * 3; // demo: each week → 3 sends
  const totalRecipients = 5;

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
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <AuroraOrbsBackground variant="dark" />
        <TextureGrain />
      </div>

      <Topbar profile={profile} />

      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Hero */}
        <section
          className="relative rounded-3xl overflow-hidden hairline bg-gradient-to-br from-emerald-500/15 via-ink-950/60 to-violet-500/10 p-6 sm:p-8 animate-fade-up"
          aria-label="Reports hero"
        >
          <div
            aria-hidden
            className="absolute inset-0 grid-bg opacity-30"
          />
          <div className="relative grid lg:grid-cols-[1.5fr,1fr] gap-6 items-center">
            <div>
              <Badge tone="good" className="!text-[10px]">
                <FileText size={10} aria-hidden className="mr-1" />
                Phase 5 · Reports center
              </Badge>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-mist-50 leading-[1.05]">
                Weekly briefs.
                <br />
                <span className="gradient-text">Always on time.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-mist-200 max-w-xl leading-relaxed">
                Curated weekly performance reports delivered to your team
                inbox, with annotated insights and ready-to-apply
                recommendations. Generate ad-hoc reports when you need to
                brief a partner.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                >
                  <FileText size={13} aria-hidden />
                  Generate report
                </Button>
                <Button variant="outline" size="md">
                  <Send size={13} aria-hidden />
                  Send now
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 max-w-md text-[11px] text-mist-400">
                <KpiPill
                  label="Avg weekly spend"
                  value={formatNaira(avgWeeklySpend)}
                />
                <KpiPill
                  label="Reports sent (90d)"
                  value={String(reportsSent)}
                />
                <KpiPill
                  label="Recipients"
                  value={String(totalRecipients)}
                  highlight
                />
              </div>
            </div>

            <div className="hidden lg:flex justify-end">
              <div className="relative w-56">
                {/* Decorative stack of report pages for hero right */}
                <span
                  aria-hidden
                  className="absolute inset-0 rotate-[-8deg] rounded-xl bg-emerald-500/[0.12] hairline"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 rotate-[-3deg] rounded-xl bg-violet-500/[0.10] hairline"
                />
                <div className="relative rounded-xl bg-mist-50/[0.04] hairline p-4">
                  <Badge tone="good" className="!text-[10px]">
                    <Calendar size={10} aria-hidden className="mr-1" />
                    This week
                  </Badge>
                  <div className="mt-3 text-2xl font-semibold text-mist-50 tabular-nums">
                    {formatCompactNumber(dashboardSummary.totalConversions)}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-mist-500">
                    Conversions
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                    <TrendingUp size={11} aria-hidden />
                    +{Math.abs(dashboardSummary.conversionsDelta).toFixed(1)}% vs last week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <section
          aria-label="Reports KPIs"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <KpiTile
            label="Latest report"
            value={featured.title}
            hint={formatNaira(dashboardSummary.totalSpend) + " tracked"}
            tone="naira"
          />
          <KpiTile
            label="Total reports (90d)"
            value={String(sortedReports.length * 12)}
            hint="Across all cadences"
            tone="violet"
          />
          <KpiTile
            label="Open rate"
            value="73%"
            hint="Across last 30 days"
            tone="violet"
          />
        </section>

        {/* Report bento */}
        <section className="space-y-5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mist-50">
                Recent reports
              </h2>
              <p className="text-sm text-mist-400">
                Tap any report to open the preview drawer.
              </p>
            </div>
            <a
              href={`/reports?rep=${rest[0]?.id ?? featured.id}`}
              className="hidden sm:inline-flex items-center gap-1 text-xs text-mist-300 hover:text-mist-50"
            >
              View archive
              <ChevronRight size={12} aria-hidden />
            </a>
          </header>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ReportCard
                report={featured}
                variant="hero"
                delay={0}
              />
            </div>
            {rest.map((r, i) => (
              <ReportCard
                key={r.id}
                report={r}
                variant="row"
                delay={(i + 1) * 60}
              />
            ))}
          </div>
        </section>

        {/* Schedule */}
        <SchedulePanel />

        <footer className="text-[11px] text-mist-400 flex flex-wrap gap-3 items-center justify-between rounded-lg hairline px-4 py-3">
          <span>
            Reports generated by the same engine that powers the
            dashboard — {campaigns.length} campaigns, 90-day trend, 1 cohort.
          </span>
          <span className="text-mist-500">PDF render &lt; 4s</span>
        </footer>
      </main>

      <Suspense fallback={null}>
        <ReportPreviewSheet reports={reports} />
      </Suspense>
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: string;
  hint: string;
  tone: "violet" | "naira";
}) {
  return (
    <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-up relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-3xl"
        style={{
          background:
            tone === "naira"
              ? "rgba(16,185,129,0.16)"
              : "rgba(167,139,250,0.16)"
        }}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-mist-500">
          {label}
        </div>
        <div className="mt-1 text-xl font-semibold text-mist-50 tabular-nums animate-count-up truncate">
          {value}
        </div>
        <div className="mt-0.5 text-[11px] text-mist-400">{hint}</div>
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

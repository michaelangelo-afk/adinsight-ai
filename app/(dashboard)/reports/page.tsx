import { Suspense } from "react";
import { Calendar, ChevronRight, Eye, FileText, Mail, Send, Wallet } from "lucide-react";

import { Topbar } from "@/components/dashboard/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
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

  const sortedReports = [...reports].sort((a, b) =>
    b.dateRangeEnd.localeCompare(a.dateRangeEnd)
  );
  const [featured, ...rest] = sortedReports;

  const avgWeeklySpend = Math.round(
    dashboardSummary.totalSpend / Math.max(1, sortedReports.length) / 2
  );
  const reportsSent = sortedReports.length * 3;
  const totalRecipients = 5;

  const fullName = user?.profile?.full_name ?? "User";
  const profile = {
    avatar:
      user?.profile?.avatar ||
      fullName
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "?",
    fullName,
    businessName: orgName
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />

      <main className="flex-1 space-y-4 px-4 py-6 md:px-6 lg:px-8">
        <PageHeader
          eyebrow="Reports center"
          title="Weekly briefs"
          description="Curated performance reports delivered to your team inbox, with annotated insights and ready-to-apply recommendations."
          actions={
            <>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.02] px-2.5 text-[11.5px] font-medium text-mist-200 transition-colors hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-white"
              >
                <Send size={12} aria-hidden />
                Send now
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-500"
              >
                <FileText size={12} aria-hidden />
                Generate report
              </button>
            </>
          }
        />

        <section
          aria-label="Reports KPIs"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <KpiTile
            icon={FileText}
            tone="#34D399"
            label="Latest report"
            value={featured.title.replace("Weekly Performance · ", "")}
            hint={`Weekly brief · ${formatNaira(
              dashboardSummary.totalSpend
            )} tracked`}
          />
          <KpiTile
            icon={Send}
            tone="#60A5FA"
            label="Reports sent (90d)"
            value={String(reportsSent)}
            hint="Across all cadences"
          />
          <KpiTile
            icon={Eye}
            tone="#A78BFA"
            label="Open rate"
            value="73%"
            hint="Across the last 30 days"
          />
          <KpiTile
            icon={Wallet}
            tone="#FBBF24"
            label="Avg weekly spend"
            value={formatNaira(avgWeeklySpend)}
            hint={`${totalRecipients} recipients`}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold tracking-tight text-mist-50">
                Recent reports
              </h2>
              <p className="mt-0.5 text-[11.5px] text-mist-500">
                Open a report to preview it before sending.
              </p>
            </div>
            <a
              href={`/reports?rep=${rest[0]?.id ?? featured.id}`}
              className="hidden items-center gap-1 text-[11.5px] font-medium text-mist-400 transition-colors hover:text-mist-100 sm:inline-flex"
            >
              View archive
              <ChevronRight size={12} aria-hidden />
            </a>
          </div>

          <div className="space-y-3">
            <ReportCard report={featured} variant="hero" delay={0} />
            <div className="grid gap-3 lg:grid-cols-2">
              {rest.map((r, i) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  variant="row"
                  delay={(i + 1) * 60}
                />
              ))}
            </div>
          </div>
        </section>

        <SchedulePanel />

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] px-4 py-3 text-[11px] text-mist-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={11} aria-hidden />
            Generated by the same engine as the dashboard — {campaigns.length}{" "}
            campaigns, 90-day trend,{" "}
            {formatCompactNumber(dashboardSummary.totalConversions)}{" "}
            conversions.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail size={11} aria-hidden />
            PDF renders under 4s
          </span>
        </footer>
      </main>

      <Suspense fallback={null}>
        <ReportPreviewSheet reports={reports} />
      </Suspense>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  tone,
  label,
  value,
  hint
}: {
  icon: typeof FileText;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="stat-label min-w-0">{label}</div>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${tone}1f`, color: tone }}
          aria-hidden
        >
          <Icon size={12} strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-1.5 truncate text-[17px] font-semibold leading-tight tracking-tight text-mist-50 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-mist-500">{hint}</div>
    </Panel>
  );
}

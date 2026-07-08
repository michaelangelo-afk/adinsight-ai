import { Topbar } from "@/components/dashboard/topbar";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PlatformChart } from "@/components/dashboard/platform-chart";
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { AccountsStrip } from "@/components/dashboard/accounts-strip";
import { dashboardSummary, reports } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <Topbar />

      <div className="flex-1 p-6 md:p-8 space-y-6">
        {/* Welcome / summary line */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-mist-400">
              Performance overview
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-mist-50 tracking-tight">
              You&apos;re <span className="gradient-text">roasting it</span> this month.
            </h1>
            <p className="mt-1 text-sm text-mist-300">
              Spend is down 12.4%, conversions up 18.2%, ROI 3.62×. Here&apos;s
              what&apos;s driving it.
            </p>
          </div>
          <AccountsStrip />
        </div>

        <MetricsGrid summary={dashboardSummary} />

        <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
          <TrendChart data={dashboardSummary.trend} />
          <PlatformChart data={dashboardSummary.platformBreakdown} />
        </div>

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
          <CampaignsTable />
          <RecommendationsPanel />
        </div>
      </div>
    </>
  );
}

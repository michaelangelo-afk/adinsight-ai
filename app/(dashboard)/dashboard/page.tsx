import { cookies } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { Topbar, type TopbarProfile } from "@/components/dashboard/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PlatformChart } from "@/components/dashboard/platform-chart";
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { AccountsStrip } from "@/components/dashboard/accounts-strip";
import { MetaActionToast } from "@/components/dashboard/meta-action-toast";
import {
  getDashboardSummary,
  getCampaigns,
  getRecommendations,
  getConnectedAccounts
} from "@/app/actions/dashboard";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";
import { META_DEMO_COOKIE, parseMetaDemoFlag } from "@/lib/action-msg";
import { readMetaEnv } from "@/lib/meta/env";
import { formatNaira } from "@/lib/utils";

/**
 * Overview.
 *
 * One screen, four bands: page header (state + actions), KPI row, performance
 * chart with the AI readout beside it, then campaigns and channel mix. Every
 * panel is the same primitive; hierarchy comes from the grid and the type
 * scale. Data still arrives from the four server actions in parallel, and
 * <AutoRefresh> keeps it fresh without re-rendering the shell.
 */
export default async function DashboardPage() {
  const [user, summary, campaigns, recommendations, accounts] =
    await Promise.all([
      getCurrentUser(),
      getDashboardSummary(),
      getCampaigns(),
      getRecommendations(),
      getConnectedAccounts()
    ]);

  const hasDemo = parseMetaDemoFlag(cookies().get(META_DEMO_COOKIE)?.value);
  const metaEnvReady = readMetaEnv().ok;

  const fullName = user?.profile?.full_name ?? "User";
  const profile: TopbarProfile = {
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
    businessName: resolveOrgName(user?.profile?.organizations ?? null)
  };

  const channelCount = summary.platformBreakdown.length;
  const convDir = summary.conversionsDelta >= 0 ? "up" : "down";

  return (
    <>
      <Topbar profile={profile} />
      <AutoRefresh interval={60_000}>
        <div className="relative flex-1 space-y-4 overflow-x-hidden px-4 py-6 md:px-6 lg:px-8">
          {/* Single page-level wash. Panels stay flat. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-page-glow"
          />

          <MetaActionToast />

          <PageHeader
            eyebrow="Last 30 days · all connected channels"
            title="Performance overview"
            description={
              <>
                {formatNaira(summary.totalSpend)} invested across {channelCount}{" "}
                channels. Conversions {convDir}{" "}
                {Math.abs(summary.conversionsDelta).toFixed(1)}%, returning{" "}
                <span className="font-medium text-mist-200">
                  {summary.roi.toFixed(2)}×
                </span>{" "}
                per naira spent.
              </>
            }
            actions={
              <>
                <AccountsStrip
                  accounts={accounts ?? []}
                  hasDemo={hasDemo}
                  metaEnvReady={metaEnvReady}
                />
                <Link
                  href="/campaigns"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-500"
                >
                  <Plus size={12} aria-hidden />
                  New campaign
                </Link>
              </>
            }
          />

          <MetricsGrid summary={summary} />

          <div className="grid gap-4 [&>*]:min-w-0 xl:grid-cols-[1.65fr,1fr]">
            <TrendChart data={summary.trend} />
            <RecommendationsPanel recommendations={recommendations ?? []} />
          </div>

          <div className="grid gap-4 [&>*]:min-w-0 xl:grid-cols-[1.45fr,1fr]">
            <CampaignsTable campaigns={campaigns ?? []} />
            <PlatformChart data={summary.platformBreakdown} />
          </div>
        </div>
      </AutoRefresh>
    </>
  );
}

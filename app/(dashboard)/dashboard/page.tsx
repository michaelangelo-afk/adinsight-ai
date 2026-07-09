import { cookies } from "next/headers";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import {
  Topbar,
  type TopbarProfile
} from "@/components/dashboard/topbar";
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
import {
  META_DEMO_COOKIE,
  parseMetaDemoFlag
} from "@/lib/action-msg";

/**
 * Phase 2 — Real-Supabase dashboard page.
 *
 * Async Server Component. Fetches the user + all four data sources in
 * parallel via `Promise.all`, then passes them as props to the
 * (now prop-driven) widget components. The page is wrapped in
 * <AutoRefresh> so RSC re-fetches happen silently every 60 seconds.
 *
 * Errors bubble up to `app/(dashboard)/error.tsx`.
 *
 * The Sidebar is rendered by `app/(dashboard)/layout.tsx` so it sits
 * outside this page (and outside <AutoRefresh>) — that avoids a double
 * render AND keeps AutoRefresh's router.refresh() from reloading the
 * Sidebar.
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

  // Read the demo flag server-side so AccountsStrip can render the
  // "Demo Meta Ads" pill without coupling to cookies() itself.
  const hasDemo = parseMetaDemoFlag(
    cookies().get(META_DEMO_COOKIE)?.value
  );

  // Topbar profile from the joined auth.users + public.users + organizations.
  // (resolveOrgName lives in app/actions/auth.ts and is shared with
  // app/(dashboard)/layout.tsx so the org-name coercion is in one place.)
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

  // Topbar is rendered OUTSIDE <AutoRefresh> so router.refresh() skips it
  // (user's profile doesn't change every 60s — no point re-rendering).
  return (
    <>
      <Topbar profile={profile} />
      <AutoRefresh interval={60_000}>
        {/* overflow-x-hidden is defense-in-depth: even though MetricTooltip
            is now portalled + clamped to the viewport, it keeps any
            (possibly forgotten) horizontal overflow from scrolling the
            body on narrow mobile breakpoints. */}
        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-x-hidden">
          {/* Phase 3.1 — flash-cookie-driven action feedback. The cookie
              has maxAge=30 so it auto-clears on next page read; the toast
              renders once per rendered action. */}
          <MetaActionToast />
          {/* Welcome / summary line */}
          {/* Welcome / summary line */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-mist-400">
                Performance overview
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-mist-50 tracking-tight">
                You&apos;re{" "}
                <span className="gradient-text">
                  {summary.totalConversions > 0
                    ? "roasting it"
                    : "getting started"}
                </span>{" "}
                this month.
              </h1>
              <p className="mt-1 text-sm text-mist-300">
                {summary.totalConversions > 0 ? (
                  <>
                    Spend is {Math.abs(summary.spendDelta).toFixed(1)}%{" "}
                    {summary.spendDelta < 0 ? "lower" : "higher"}, conversions{" "}
                    {summary.conversionsDelta >= 0 ? "up" : "down"}{" "}
                    {Math.abs(summary.conversionsDelta).toFixed(1)}%, ROI{" "}
                    {summary.roi.toFixed(2)}×. Here&apos;s what&apos;s driving
                    it.
                  </>
                ) : (
                  <>
                    Connect an ad account to start syncing campaign metrics,
                    spend, and AI recommendations.
                  </>
                )}
              </p>
            </div>
            <AccountsStrip accounts={accounts ?? []} hasDemo={hasDemo} />
          </div>

          <MetricsGrid summary={summary} />

          <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
            <TrendChart data={summary.trend} />
            <PlatformChart data={summary.platformBreakdown} />
          </div>

          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
            <CampaignsTable campaigns={campaigns ?? []} />
            <RecommendationsPanel recommendations={recommendations ?? []} />
          </div>
        </div>
      </AutoRefresh>
    </>
  );
}

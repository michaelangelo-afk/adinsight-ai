import { Plus, RefreshCw, Link2, Sparkles, ExternalLink } from "lucide-react";
import type { AdAccount } from "@/lib/types";
import { connectMeta, connectDemoMeta, syncInsights } from "@/app/actions/meta";
import { MetaLogo } from "@/components/brand/meta-logo";
import { MetricTooltip } from "@/components/ui/tooltip";
import { DemoPillTip } from "@/lib/metric-tooltips";

/** Deep-link to the Meta app creation wizard — opened when env vars are
 *  missing so users get pointed at the actual setup instead of a
 *  dead-end Connect button. Use `target=_blank` so they keep their
 *  dashboard context. */
const META_APP_CREATE_URL = "https://developers.facebook.com/apps/create";

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  meta: { name: "Meta Ads", color: "#9b6cff" },
  google: { name: "Google Ads", color: "#1ed68f" },
  tiktok: { name: "TikTok Ads", color: "#5ee5ad" }
};

/**
 * Renders the brand mark for a platform. Meta gets the official M
 * gradient mark; other platforms keep a colored dot for now until
 * Google + TikTok brand marks are added in a follow-up.
 */
function PlatformMark({ platform }: { platform: string }) {
  if (platform === "meta") return <MetaLogo size="xs" />;
  const color = PLATFORM_META[platform]?.color ?? "#9b6cff";
  return (
    <span
      className="h-2 w-2 rounded-full shrink-0"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}

export function AccountsStrip({
  accounts,
  hasDemo,
  metaEnvReady = true
}: {
  accounts: AdAccount[];
  /**
   * When true, render a synthetic "Demo Meta Ads" pill using the same
   * visual language as a real connected account. Source of truth is the
   * META_DEMO_COOKIE flag set by connectDemoMeta; the dashboard page
   * reads it server-side and forwards the boolean here so we don't have
   * to import `cookies()` into a client-or-bare component.
   */
  hasDemo?: boolean;
  /**
   * Whether the META_APP_ID / META_APP_SECRET env vars are set on the
   * server. When false, the Connect / Sync server actions would dead-end
   * with the env-config toast; better to replace them with a 'Set up
   * your Meta app' CTA pointing at developers.facebook.com/apps/create.
   * The dashboard reads `readMetaEnv()` server-side and forwards the
   * boolean here so the component stays a pure Server Component.
   *
   * Default true to keep legacy call sites backwards-compatible — only
   * the dashboard page wires this prop today.
   */
  metaEnvReady?: boolean;
}) {
  // Sync is meaningful only when a real Meta connection exists; on a
  // bare dashboard (no accounts) it's a dead button that fires the
  // env-config error.
  const hasMetaAccount = accounts.some((a) => a.platform === "meta");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasDemo && (
        <div
          data-demo-pill="1"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-violet-500/15 hairline text-xs"
        >
          <MetaLogo size="xs" />
          <span className="text-ink-900 dark:text-mist-100">
            <MetricTooltip
              content={DemoPillTip}
              label="What demo mode means"
              side="bottom"
            >
              <span>Meta Ads</span>
            </MetricTooltip>
          </span>
          <span
            title="Demo mode — no real Meta OAuth. Connect Meta Ads to swap to live data."
            className="chip px-2 py-0 text-[9px] uppercase tracking-wider bg-violet-500/30 text-violet-100 border border-violet-500/40"
          >
            demo
          </span>
        </div>
      )}
      {accounts.map((a) => {
        const meta = PLATFORM_META[a.platform] ?? {
          name: a.platform,
          color: "#9b6cff"
        };
        return (
          <div
            key={a.id}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs"
          >
            <PlatformMark platform={a.platform} />
            <span className="text-mist-100">{meta.name}</span>
            <span
              className={`chip px-2 py-0 text-[9px] uppercase tracking-wider ${
                a.isActive
                  ? "bg-naira-500/15 text-naira-300 border border-naira-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              {a.isActive ? "live" : "paused"}
            </span>
          </div>
        );
      })}

      {accounts.length === 0 && (
        <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-mist-600 dark:text-mist-400">
          <Link2 size={12} />
          No accounts connected yet
        </div>
      )}

      {metaEnvReady ? (
        <>
          {/* Connect — server action sets a CSRF state cookie + redirects
              to Facebook OAuth. The form's "contents" class lets the
              button participate in the parent flex layout as if it
              weren't wrapped. The `title` attribute explicitly previews
              what'll appear next so non-developer testers don't read a
              "no permission dialog was shown" bug into Meta's normal
              consent screen. */}
          <form action={connectMeta} className="contents">
            <button
              type="submit"
              title="We'll redirect you to Meta so you can approve the app to read your ad accounts."
              aria-label="Connect your Meta Ads account (opens Meta's permission screen)"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-xs text-violet-700 hover:bg-violet-500/25 hover:border-violet-400/50 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 dark:text-violet-200"
            >
              <Plus
                size={12}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
              Connect
            </button>
          </form>
          {/* Try demo — secondary action for users without a real Meta
              Ads account today. Upserts a row into meta_connections with
              a recognizable demo sentinel so a future real OAuth upsert
              can cleanly overwrite it via the user_id unique constraint.
              DemoMode is also the right answer on env-not-ready states
              when the user wants to explore the dashboard before they
              have time to set up Meta. */}
          <form action={connectDemoMeta} className="contents">
            <button
              type="submit"
              aria-label="Connect a demo Meta ad account (no real OAuth)"
              title="Demo mode — populates the connected-state UI without real Meta OAuth. Connect Meta Ads later to swap to live insights."
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-ink-800 hover:text-ink-900 hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 dark:text-mist-300 dark:hover:text-mist-100"
            >
              <Sparkles
                size={12}
                className="transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-700 dark:group-hover:text-violet-200"
              />
              Try demo
            </button>
          </form>
          {/* Sync — only meaningful after a real Meta connection has
              established an access_token; the action would fire an
              env-config or no_connection toast otherwise. Hidden on
              empty accounts to avoid the dead-button UX. */}
          {hasMetaAccount && (
            <form action={syncInsights} className="contents">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-ink-800 hover:text-ink-900 hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 dark:text-mist-300 dark:hover:text-mist-100"
              >
                <RefreshCw
                  size={12}
                  className="transition-transform duration-500 group-hover:rotate-180"
                />
                Sync
              </button>
            </form>
          )}
        </>
      ) : (
        // Env not ready: Connect / Sync would dead-end with the same
        // env-config toast we've already deemed unhelpful. Surface a CTA
        // that points the user at the actual setup wizard. Anchor
        // (target=_blank) so the dashboard context is preserved.
        <a
          href={META_APP_CREATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Set up a Meta developer app (opens in new tab)"
          title="Open the Meta developer portal to create the App ID + Secret — opens in a new tab so you keep your dashboard state."
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-xs text-violet-700 hover:bg-violet-500/25 hover:border-violet-400/50 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 dark:text-violet-200"
        >
          <ExternalLink
            size={12}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
          Set up Meta Ads
        </a>
      )}
    </div>
  );
}

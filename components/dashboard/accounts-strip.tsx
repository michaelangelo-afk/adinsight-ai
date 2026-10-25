import { Plus, RefreshCw, Sparkles, ExternalLink } from "lucide-react";
import type { AdAccount } from "@/lib/types";
import { connectMeta, connectDemoMeta, syncInsights } from "@/app/actions/meta";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { MetricTooltip } from "@/components/ui/tooltip";
import { DemoPillTip } from "@/lib/metric-tooltips";

/** Deep-link to the Meta app creation wizard when env vars are missing. */
const META_APP_CREATE_URL = "https://developers.facebook.com/apps/create";

const PLATFORM_LABEL: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads"
};

const pill =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-medium transition-colors duration-150";
const ghost =
  "border border-white/[0.08] text-mist-300 hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-mist-50";
const accent = "border border-brand-500/30 bg-brand-500/[0.10] text-brand-200 hover:bg-brand-500/[0.18]";

/**
 * AccountsStrip — connection state plus the actions that change it.
 *
 * Sits in the page header. Each connected account is a quiet pill; the one
 * primary action (Connect) is accent-tinted. Buttons that would dead-end are
 * swapped for the real next step instead of firing an error toast.
 */
export function AccountsStrip({
  accounts,
  hasDemo,
  metaEnvReady = true
}: {
  accounts: AdAccount[];
  hasDemo?: boolean;
  metaEnvReady?: boolean;
}) {
  const hasMetaAccount = accounts.some((a) => a.platform === "meta");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasDemo && (
        <span
          data-demo-pill="1"
          className={`${pill} border border-brand-500/30 bg-brand-500/[0.10]`}
        >
          <PlatformLogo platform="meta" size="xs" />
          <MetricTooltip
            content={DemoPillTip}
            label="What demo mode means"
            side="bottom"
          >
            <span className="text-mist-100">Meta Ads</span>
          </MetricTooltip>
          <span className="rounded bg-brand-500/20 px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-brand-200">
            demo
          </span>
        </span>
      )}

      {accounts.map((a) => (
        <span
          key={a.id}
          className={`${pill} border border-white/[0.07] bg-white/[0.03]`}
        >
          <PlatformLogo platform={a.platform} size="xs" />
          <span className="text-mist-200">
            {PLATFORM_LABEL[a.platform] ?? a.platform}
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              a.isActive ? "bg-brand-400" : "bg-amber-400"
            }`}
            aria-hidden
          />
          <span className="sr-only">{a.isActive ? "live" : "paused"}</span>
        </span>
      ))}

      {accounts.length === 0 && !hasDemo && (
        <span className={`${pill} border border-white/[0.07] text-mist-500`}>
          No accounts connected
        </span>
      )}

      {metaEnvReady ? (
        <>
          <form action={connectMeta} className="contents">
            <button
              type="submit"
              title="We'll redirect you to Meta so you can approve the app to read your ad accounts."
              aria-label="Connect your Meta Ads account (opens Meta's permission screen)"
              className={`${pill} ${accent}`}
            >
              <Plus size={12} aria-hidden />
              Connect
            </button>
          </form>
          <form action={connectDemoMeta} className="contents">
            <button
              type="submit"
              aria-label="Connect a demo Meta ad account (no real OAuth)"
              title="Demo mode — populates the connected-state UI without real Meta OAuth."
              className={`${pill} ${ghost}`}
            >
              <Sparkles size={12} aria-hidden />
              Try demo
            </button>
          </form>
          {hasMetaAccount && (
            <form action={syncInsights} className="contents">
              <button
                type="submit"
                className={`${pill} ${ghost}`}
                aria-label="Sync insights from Meta"
              >
                <RefreshCw size={12} aria-hidden />
                Sync
              </button>
            </form>
          )}
        </>
      ) : (
        <a
          href={META_APP_CREATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Set up a Meta developer app (opens in new tab)"
          title="Open the Meta developer portal to create the App ID + Secret — opens in a new tab so you keep your dashboard state."
          className={`${pill} ${accent}`}
        >
          <ExternalLink size={12} aria-hidden />
          Set up Meta Ads
        </a>
      )}
    </div>
  );
}

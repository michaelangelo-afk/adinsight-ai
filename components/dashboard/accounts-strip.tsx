import { Plus, RefreshCw, Link2, Sparkles } from "lucide-react";
import type { AdAccount } from "@/lib/types";
import { connectMeta, connectDemoMeta, syncInsights } from "@/app/actions/meta";

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  meta: { name: "Meta Ads", color: "#9b6cff" },
  google: { name: "Google Ads", color: "#1ed68f" },
  tiktok: { name: "TikTok Ads", color: "#5ee5ad" }
};

export function AccountsStrip({ accounts }: { accounts: AdAccount[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
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
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: meta.color }}
            />
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
        <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-mist-400">
          <Link2 size={12} />
          No accounts connected yet
        </div>
      )}

      {/* Connect — server action sets a CSRF state cookie + redirects to
          Facebook OAuth. The form's "contents" class lets the button
          participate in the parent flex layout as if it weren't wrapped. */}
      <form action={connectMeta} className="contents">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-xs text-violet-200 hover:bg-violet-500/25 hover:border-violet-400/50 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <Plus size={12} className="transition-transform duration-300 group-hover:rotate-90" />
          Connect
        </button>
      </form>
      {/* Try demo — secondary action for users without a real Meta Ads
          account today. Upserts a row into meta_connections with a
          recognizable demo sentinel so a future real OAuth upsert can
          cleanly overwrite it via the user_id unique constraint. */}
      <form action={connectDemoMeta} className="contents">
        <button
          type="submit"
          aria-label="Connect a demo Meta ad account (no real OAuth)"
          title="Demo mode — populates the connected-state UI without real Meta OAuth. Connect Meta Ads later to swap to live insights."
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-mist-300 hover:text-mist-100 hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <Sparkles size={12} className="transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-200" />
          Try demo
        </button>
      </form>
      {/* Sync — server action re-fetches Meta insights and revalidates
          /dashboard so the auto-refresh tick picks up the change. */}
      <form action={syncInsights} className="contents">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-mist-300 hover:text-mist-100 hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <RefreshCw size={12} className="transition-transform duration-500 group-hover:rotate-180" />
          Sync
        </button>
      </form>
    </div>
  );
}

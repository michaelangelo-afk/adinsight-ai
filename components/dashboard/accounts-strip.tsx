import { Plus, RefreshCw, Link2 } from "lucide-react";
import type { AdAccount } from "@/lib/types";

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

      <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-xs text-violet-200 hover:bg-violet-500/20">
        <Plus size={12} />
        Connect
      </button>
      <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs text-mist-300 hover:text-mist-100">
        <RefreshCw size={12} />
        Sync
      </button>
    </div>
  );
}

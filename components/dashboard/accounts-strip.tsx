import { Plus, RefreshCw } from "lucide-react";
import { connectedAccounts } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const META: Record<string, { name: string; color: string }> = {
  meta: { name: "Meta Ads", color: "#9b6cff" },
  google: { name: "Google Ads", color: "#1ed68f" },
  tiktok: { name: "TikTok Ads", color: "#5ee5ad" }
};

export function AccountsStrip() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {connectedAccounts.map((a) => (
        <div
          key={a.id}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-xs"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: META[a.platform].color }}
          />
          <span className="text-mist-100">{META[a.platform].name}</span>
          <Badge tone="good" className="text-[9px]">
            live
          </Badge>
        </div>
      ))}
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

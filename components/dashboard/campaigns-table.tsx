"use client";

import { useState } from "react";
import { Pause, Play, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { campaigns } from "@/lib/mock-data";
import { formatNaira, formatPercent } from "@/lib/utils";

function Sparkline({ data, tone }: { data: number[]; tone: "good" | "warn" | "bad" }) {
  const w = 80;
  const h = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    tone === "good" ? "#1ed68f" : tone === "warn" ? "#fbbf24" : "#fb7185";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-20 h-6"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlatformDot({ platform }: { platform: string }) {
  const map: Record<string, string> = {
    meta: "#9b6cff",
    google: "#1ed68f",
    tiktok: "#5ee5ad"
  };
  return (
    <span
      className="h-2 w-2 rounded-full inline-block"
      style={{ background: map[platform] ?? "#9b6cff" }}
    />
  );
}

function statusTone(
  status: "active" | "paused" | "completed"
): "good" | "warn" | "neutral" {
  if (status === "active") return "good";
  if (status === "paused") return "warn";
  return "neutral";
}

export function CampaignsTable() {
  const [sortKey, setSortKey] = useState<"spend" | "conversions" | "cpc">(
    "spend"
  );
  const sorted = [...campaigns].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-mist-400">
            Campaigns
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            How every campaign is performing
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Sort by spend, conversions or CPC. Click a campaign for drill-down.
          </p>
        </div>
        <button className="hidden md:inline-flex items-center gap-2 rounded-lg bg-mist-50/[0.04] hairline px-3 py-1.5 text-xs text-mist-200 hover:bg-mist-50/[0.08]">
          <ArrowUpDown size={12} />
          Sort:{" "}
          <span className="text-mist-50 font-medium capitalize">
            {sortKey}
          </span>
        </button>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2 mb-3">
        {(["spend", "conversions", "cpc"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setSortKey(k)}
            className={
              "rounded-full px-3 py-1 text-xs font-medium transition-colors " +
              (sortKey === k
                ? "bg-violet-500/20 border border-violet-500/40 text-violet-200"
                : "bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50")
            }
          >
            By {k}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-mist-400 border-b border-mist-50/[0.06]">
              <th className="text-left py-3 px-2 font-medium">Campaign</th>
              <th className="text-right py-3 px-2 font-medium">Spend</th>
              <th className="text-right py-3 px-2 font-medium hidden md:table-cell">
                Conversions
              </th>
              <th className="text-right py-3 px-2 font-medium hidden md:table-cell">
                CPC
              </th>
              <th className="text-right py-3 px-2 font-medium">Trend</th>
              <th className="text-right py-3 px-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const tone =
                c.status === "active"
                  ? "good"
                  : c.status === "paused"
                  ? "warn"
                  : "bad";
              return (
                <tr
                  key={c.id}
                  className="border-b border-mist-50/[0.04] last:border-0 group hover:bg-mist-50/[0.02]"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <PlatformDot platform={c.platform} />
                      <span className="text-mist-50 font-medium">
                        {c.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-mist-500 ml-4.5 mt-0.5 capitalize">
                      {c.platform} · {formatPercent(c.ctr, 2)} CTR
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-mist-50">
                    {formatNaira(c.spend)}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-mist-200 hidden md:table-cell">
                    {c.conversions}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-mist-200 hidden md:table-cell">
                    ₦{c.cpc.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex justify-end">
                      <Sparkline
                        data={c.trend}
                        tone={tone as "good" | "warn" | "bad"}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Badge tone={statusTone(c.status)}>
                        {c.status}
                      </Badge>
                      <button
                        type="button"
                        aria-disabled="true"
                        aria-label={c.status === "active" ? "Pause campaign" : "Resume campaign"}
                        title={`Demo action — would ${c.status === "active" ? "pause" : "resume"} ${c.name}`}
                        onClick={(e) => e.preventDefault()}
                        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded text-mist-500 cursor-not-allowed"
                      >
                        {c.status === "active" ? (
                          <Pause size={13} />
                        ) : (
                          <Play size={13} />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-disabled="true"
                        aria-label="More actions"
                        title={`Demo action — open details for ${c.name}`}
                        onClick={(e) => e.preventDefault()}
                        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded text-mist-500 cursor-not-allowed"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

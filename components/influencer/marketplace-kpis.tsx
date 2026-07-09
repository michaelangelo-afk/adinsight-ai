// components/influencer/marketplace-kpis.tsx
//
// Phase 4 — 4 hero KPIs for the Influencer Sector. Mirrors the
// Phase 3 MetricsGrid pattern: glass-card, hover-lift, animate-fade-up
// stagger, sparkline, color-coded delta. Server Component (no hooks).

import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Users,
  Radio,
  Wallet
} from "lucide-react";
import { formatCompactNumber, formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceStats } from "@/lib/influencer/compare-to-ads";
import { sparkFromAggregate } from "@/lib/influencer/compare-to-ads";

function MiniSpark({
  data,
  tone
}: {
  data: number[];
  tone: "violet" | "naira";
}) {
  const w = 100;
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
  const stroke = tone === "naira" ? "#10B981" : "#A78BFA";
  const fill = tone === "naira" ? "#10B981" : "#A78BFA";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-6"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-marketplace-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.4" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#spark-marketplace-${tone})`}
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CardSpec {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: "violet" | "naira";
  spark: number[];
  badgeTone?: "good" | "neutral" | "violet";
  badgeText?: string;
}

function buildCards(s: MarketplaceStats): CardSpec[] {
  return [
    {
      label: "Vetted creators",
      value: String(s.totalCreators),
      hint: "across 4 cities · 10 niches",
      icon: Users,
      tone: "violet",
      spark: sparkFromAggregate(s.totalCreators * 1.2),
      badgeTone: "violet",
      badgeText: `${s.highFitCount} high-fit`
    },
    {
      label: "Avg fit score",
      value: `${s.averageFit}`,
      hint: "out of 100 — weighted overlap",
      icon: Sparkles,
      tone: "naira",
      spark: sparkFromAggregate(s.averageFit * 1.1),
      badgeTone: s.averageFit >= 60 ? "good" : "neutral",
      badgeText: s.averageFit >= 60 ? "healthy" : "working"
    },
    {
      label: "Total reach",
      value: `${formatCompactNumber(s.totalReach)}`,
      hint: "aggregated follower count",
      icon: Radio,
      tone: "violet",
      spark: sparkFromAggregate(s.totalReach / 1000),
      badgeTone: "violet",
      badgeText: "all channels"
    },
    {
      label: "Avg cost / 1k followers",
      value: formatNaira(s.averageCpmBy1000Followers),
      hint: "vs ₦167/1k reach on Meta Retargeting",
      icon: Wallet,
      tone: "naira",
      spark: sparkFromAggregate(s.averageCpmBy1000Followers / 80),
      badgeTone: "good",
      badgeText: "vs ads —40%"
    }
  ];
}

export function MarketplaceKpis({ stats }: { stats: MarketplaceStats }) {
  const cards = buildCards(stats);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="glass-card rounded-2xl p-5 sm:p-6 group hover-lift animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-100 group-hover:border-violet-300 dark:group-hover:bg-violet-500/15 dark:group-hover:border-violet-500/40">
                <Icon
                  size={16}
                  className="text-violet-700 dark:text-violet-300 transition-transform duration-300 group-hover:rotate-[8deg]"
                />
              </div>
              {c.badgeTone && c.badgeText && (
                <Badge tone={c.badgeTone}>{c.badgeText}</Badge>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-600 dark:text-mist-400">
                {c.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-mist-50 tabular-nums animate-count-up">
                {c.value}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-mist-500">
                {c.hint}
              </div>
            </div>
            <div className="mt-3">
              <MiniSpark data={c.spark} tone={c.tone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

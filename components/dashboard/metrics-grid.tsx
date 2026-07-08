import {
  Banknote,
  Users,
  Coins,
  TrendingUp,
  TrendingDown,
  type LucideIcon
} from "lucide-react";
import { formatDelta, formatNaira } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

type Card = {
  label: string;
  value: string;
  delta: number;
  invertColor: boolean;
  icon: LucideIcon;
  series: number[];
  sub?: string;
};

function buildCards(s: DashboardSummary): Card[] {
  // Build a 14-day mini series per card by sampling the trend
  const seriesFor = (key: "spend" | "conversions") =>
    s.trend.slice(-14).map((d) => d[key]);

  return [
    {
      label: "Total spend",
      value: formatNaira(s.totalSpend),
      delta: s.spendDelta,
      invertColor: true, // negative is good
      icon: Banknote,
      series: seriesFor("spend"),
      sub: "last 30 days"
    },
    {
      label: "Conversions",
      value: s.totalConversions.toLocaleString(),
      delta: s.conversionsDelta,
      invertColor: false,
      icon: Users,
      series: seriesFor("conversions"),
      sub: "last 30 days"
    },
    {
      label: "Avg CPC",
      value: `₦${s.averageCpc.toFixed(2)}`,
      delta: s.cpcDelta,
      invertColor: true,
      icon: Coins,
      series: seriesFor("spend").map((v) => v / 40),
      sub: "across all campaigns"
    },
    {
      label: "ROI",
      value: `${s.roi.toFixed(2)}×`,
      delta: s.roiDelta,
      invertColor: false,
      icon: TrendingUp,
      series: seriesFor("conversions").map((v) => v * 8),
      sub: "return per ₦1 spent"
    }
  ];
}

function MiniSpark({ data, tone }: { data: number[]; tone: "violet" | "naira" }) {
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
  // Positive deltas render in emerald ("naira" tone — green, growth).
  // Negative deltas render in rose so the chart stays semantically distinct
  // (\"down\" reads as a warning, not another shade of green).
  const stroke = tone === "naira" ? "#10B981" : "#F43F5E";
  const fill = tone === "naira" ? "#10B981" : "#F43F5E";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-6"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.4" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#spark-${tone})`}
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

export function MetricsGrid({ summary }: { summary: DashboardSummary }) {
  const cards = buildCards(summary);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const isPositive =
          c.invertColor ? c.delta < 0 : c.delta > 0;
        const tone = isPositive ? "naira" : "violet";
        return (
          <div
            key={c.label}
            className="glass-card rounded-2xl p-5 group hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-mist-50/[0.04] hairline">
                <Icon size={16} className="text-violet-300" />
              </div>
              <span
                className={
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium " +
                  (isPositive
                    ? "bg-naira-500/15 text-naira-400"
                    : "bg-rose-500/15 text-rose-400")
                }
              >
                {isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {formatDelta(c.delta).replace(/^[▲▼]\s*/, "")}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-mist-400">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-mist-50">
                {c.value}
              </div>
              {c.sub && (
                <div className="mt-0.5 text-[11px] text-mist-500">{c.sub}</div>
              )}
            </div>
            <div className="mt-3">
              <MiniSpark data={c.series} tone={tone as "violet" | "naira"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
import { MetricTooltip } from "@/components/ui/tooltip";
import { SERIES } from "@/lib/chart-theme";
import {
  SpendTip,
  ConversionsTip,
  CpcTip,
  RoiTip,
  DeltaTip
} from "@/lib/metric-tooltips";

type Card = {
  label: string;
  value: string;
  delta: number;
  /** true when a negative delta is the good outcome (cost metrics). */
  invertColor: boolean;
  icon: LucideIcon;
  series: number[];
  sub: string;
  tone: string;
  /** Tooltip body (definition + formula + heuristic) for the metric label */
  tooltip: React.ReactNode;
  /** aria-label for the MetricTooltip's info button */
  tooltipLabel: string;
};

function buildCards(s: DashboardSummary): Card[] {
  // 14-day mini series per card, sampled from the shared trend.
  const seriesFor = (key: "spend" | "conversions") =>
    s.trend.slice(-14).map((d) => d[key]);

  return [
    {
      label: "Spend",
      value: formatNaira(s.totalSpend),
      delta: s.spendDelta,
      invertColor: true,
      icon: Banknote,
      series: seriesFor("spend"),
      sub: "last 30 days",
      tone: SERIES.green,
      tooltip: SpendTip,
      tooltipLabel: "What total spend means"
    },
    {
      label: "Conversions",
      value: s.totalConversions.toLocaleString(),
      delta: s.conversionsDelta,
      invertColor: false,
      icon: Users,
      series: seriesFor("conversions"),
      sub: "last 30 days",
      tone: SERIES.blue,
      tooltip: ConversionsTip,
      tooltipLabel: "What conversions means"
    },
    {
      label: "Avg. cost per click",
      value: `₦${s.averageCpc.toFixed(2)}`,
      delta: s.cpcDelta,
      invertColor: true,
      icon: Coins,
      series: seriesFor("spend").map((v) => v / 40),
      sub: "across all campaigns",
      tone: SERIES.violet,
      tooltip: CpcTip,
      tooltipLabel: "What cost-per-click means"
    },
    {
      label: "Return on spend",
      value: `${s.roi.toFixed(2)}×`,
      delta: s.roiDelta,
      invertColor: false,
      icon: TrendingUp,
      series: seriesFor("conversions").map((v) => v * 8),
      sub: "per ₦1 spent",
      tone: SERIES.amber,
      tooltip: RoiTip,
      tooltipLabel: "What ROI means"
    }
  ];
}

/**
 * Sparkline — a 34px trend strip. One gradient id per card so four cards can
 * share the component without their `<defs>` colliding, which is what made the
 * previous version render the same fill for every card.
 */
function Sparkline({
  data,
  tone,
  id
}: {
  data: number[];
  tone: string;
  id: string;
}) {
  const w = 160;
  const h = 40;
  if (data.length < 2) return <div className="h-[40px]" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-[40px] w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.26" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MetricsGrid({ summary }: { summary: DashboardSummary }) {
  const cards = buildCards(summary);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const isGood = c.invertColor ? c.delta < 0 : c.delta > 0;
        return (
          <article
            key={c.label}
            className="group relative overflow-hidden rounded-xl border border-white/[0.085] bg-[#0b111c] px-4 pb-3 pt-4 transition-colors duration-200 hover:border-white/[0.16]"
          >
            {/* One colour per card, at whisper strength, corner-anchored. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-6 -top-10 h-24 w-24 rounded-full opacity-[0.13] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
              style={{ background: c.tone }}
            />

            <div className="relative flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset"
                style={{
                  backgroundColor: `${c.tone}1f`,
                  color: c.tone,
                  boxShadow: `inset 0 0 0 1px ${c.tone}2e`
                }}
                aria-hidden
              >
                <Icon size={15} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-mist-100">
                  <MetricTooltip
                    content={c.tooltip}
                    label={c.tooltipLabel}
                    side="top"
                  >
                    <span>{c.label}</span>
                  </MetricTooltip>
                </div>
                <div className="text-[10.5px] text-mist-500">{c.sub}</div>
              </div>
            </div>

            <div className="relative mt-3.5 flex items-end justify-between gap-2">
              <div className="text-[27px] font-semibold leading-[1] tracking-[-0.025em] text-mist-50 tabular-nums">
                {c.value}
              </div>
              <MetricTooltip
                content={DeltaTip}
                label="What the period-vs-period delta means"
                side="bottom"
              >
                <span
                  className={
                    "mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] font-semibold tabular-nums " +
                    (isGood
                      ? "bg-brand-500/[0.14] text-brand-300"
                      : "bg-rose-500/[0.14] text-rose-300")
                  }
                >
                  {isGood ? (
                    <TrendingUp size={11} aria-hidden />
                  ) : (
                    <TrendingDown size={11} aria-hidden />
                  )}
                  {formatDelta(c.delta).replace(/^[▲▼]\s*/, "")}
                </span>
              </MetricTooltip>
            </div>

            <div className="relative -mx-1 mt-2.5">
              <Sparkline data={c.series} tone={c.tone} id={`kpi-spark-${i}`} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

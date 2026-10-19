import * as React from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Home,
  Megaphone,
  Rocket,
  Settings,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PatternField, SignalRings } from "@/components/landing/pattern-field";
import { dashboardSummary, campaigns } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";

/**
 * Hero — dark, centred, product-first.
 *
 * Structure mirrors the reference (Madgicx): a translucent floating nav, one
 * 64px centred headline with a white→72% fade and a single accent phrase, two
 * pill CTAs, then the product itself as a large rounded plate on a soft glow.
 * The plate is a real interface — KPI cards, a spend chart, AI actions and the
 * campaign table — not an abstract illustration.
 */

const KPIS = [
  { label: "Ad spend", value: formatNaira(dashboardSummary.totalSpend), delta: "−12.4%", up: false },
  { label: "Conversions", value: dashboardSummary.totalConversions.toLocaleString(), delta: "+18.2%", up: true },
  { label: "Avg. CPC", value: `₦${dashboardSummary.averageCpc.toFixed(2)}`, delta: "−8.7%", up: true },
  { label: "ROAS", value: `${dashboardSummary.roi.toFixed(2)}×`, delta: "+22.4%", up: true }
];

const RAIL = [
  { icon: Home, label: "Overview", active: true },
  { icon: BarChart3, label: "Analytics" },
  { icon: Megaphone, label: "Campaigns" },
  { icon: Bot, label: "Automations" },
  { icon: Users, label: "Influencers" },
  { icon: Settings, label: "Settings" }
];

function SpendChart() {
  const trend = dashboardSummary.trend;
  const max = Math.max(...trend.map((d) => d.spend));
  const min = Math.min(...trend.map((d) => d.spend));
  const range = max - min || 1;
  const w = 320;
  const h = 96;
  const pts = trend
    .map((d, i) => {
      const x = (i / (trend.length - 1)) * w;
      const y = h - ((d.spend - min) / range) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="Spend trend, last 30 days">
      <defs>
        <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill="url(#hero-fill)" stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppPreview() {
  return (
    <div className="plate">
      {/* App chrome */}
      <div className="flex items-center gap-2 border-b border-shell/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-shell/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-shell/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-shell/10" />
        <div className="mx-auto hidden items-center gap-2 rounded-full border border-shell/10 bg-shell/[0.03] px-3 py-1 text-xs text-shell/55 sm:flex">
          app.growthads.ng / overview
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        {/* Rail */}
        <aside className="hidden border-r border-shell/8 p-3 md:block">
          <div className="mb-4 flex items-center gap-2 px-2 py-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-accent">
              <Rocket size={14} />
            </span>
            <span className="text-sm font-medium text-shell">GrowthAds</span>
          </div>
          {RAIL.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.label}
                className={
                  "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs " +
                  (r.active ? "bg-shell/[0.07] text-shell" : "text-shell/55")
                }
              >
                <Icon size={14} />
                {r.label}
              </div>
            );
          })}
          <div className="mt-6 rounded-xl border border-accent/20 bg-brand-500/[0.07] p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <Sparkles size={12} /> AI media buyer
            </div>
            <p className="mt-1 text-xs leading-relaxed text-shell/55">
              3 actions ready for review.
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-shell">Performance overview</div>
              <div className="text-xs text-shell/55">All platforms · last 30 days</div>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-shell/10 px-2.5 py-1 text-xs text-shell/55 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-xl border border-shell/8 bg-shell/[0.025] p-3">
                <div className="text-xs text-shell/55">{k.label}</div>
                <div className="mt-1 font-mono text-sm font-medium text-shell">{k.value}</div>
                <div
                  className={
                    "mt-1 flex items-center gap-1 text-xs " +
                    (k.up ? "text-accent" : "text-shell/55")
                  }
                >
                  {k.up && <TrendingUp size={10} />}
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl border border-shell/8 bg-shell/[0.02] p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-shell/55">Spend vs. conversions</span>
                <span className="text-xs text-accent">+18.4% MoM</span>
              </div>
              <SpendChart />
            </div>

            <div className="rounded-xl border border-shell/8 bg-shell/[0.02] p-3">
              <div className="mb-2 text-xs text-shell/55">Today&apos;s actions</div>
              {[
                ["Pause 11 stalled story ads", "₦62,400 saved"],
                ["Shift 10% to Lagos winners", "ROAS 4.1×"],
                ["Refresh 3 fatigued creatives", "CTR −22%"]
              ].map(([title, note]) => (
                <div key={title} className="flex items-start justify-between gap-2 border-t border-shell/8 py-2 first:border-0 first:pt-0">
                  <span className="text-xs leading-snug text-shell/75">{title}</span>
                  <span className="shrink-0 text-xs text-accent">{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-shell/8">
            <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] gap-2 border-b border-shell/8 bg-shell/[0.03] px-3 py-2 text-xs text-shell/55 sm:grid">
              <span>Campaign</span>
              <span>Spend</span>
              <span>Conversions</span>
              <span>ROAS</span>
            </div>
            {campaigns.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1.6fr_0.8fr] gap-2 border-b border-shell/5 px-3 py-2 text-xs last:border-0 sm:grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr]"
              >
                <span className="flex items-center gap-2 truncate text-shell/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  {c.name}
                </span>
                <span className="font-mono text-shell/60">{formatNaira(c.spend)}</span>
                <span className="hidden font-mono text-shell/60 sm:block">{c.conversions}</span>
                <span className="hidden font-mono text-accent sm:block">
                  {(c.spend > 0 ? (c.conversions * 3500) / c.spend : 0).toFixed(1)}×
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="statement" className="relative isolate overflow-hidden pb-16 pt-32 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 glow-bed" />

      {/* Instrument field: a 64/16 plot grid, faded to zero before the
          headline, and one ring set centred on the product plate. */}
      <PatternField motif="grid" mask="radial" className="inset-x-0 top-0 h-[680px]" />
      <div className="pointer-events-none absolute inset-x-0 top-[300px] -z-10 flex justify-center text-accent/40">
        <SignalRings rings={7} step={64} className="relative h-[820px] w-[820px] opacity-70" />
      </div>

      <div className="mx-auto max-w-content px-gutter text-center lg:px-gutter-lg">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Built for Nigerian SMEs · Meta, Google &amp; TikTok
        </span>

        <h1 className="headline-fade mx-auto mt-6 max-w-4xl text-5xl font-medium sm:text-6xl md:text-7xl">
          Make every naira
          <br className="hidden sm:block" /> <span className="accent-text">work harder.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-shell/60 sm:text-lg">
          GrowthAds reads Meta, Google and TikTok every night, kills the ads
          that waste money, and hands you the three moves that grow it — one
          dashboard, one Monday report.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" variant="white" size="lg" className="group w-full sm:w-auto">
            Try for free
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </LinkButton>
          <LinkButton href="#workflow" variant="glass" size="lg" className="w-full sm:w-auto">
            See how it works
          </LinkButton>
        </div>

        <p className="mt-4 text-xs text-shell/55">
          No credit card · 14-day trial · Billed in Naira via Paystack
        </p>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div
            aria-hidden
            className="absolute -inset-x-10 -top-12 bottom-12 -z-10 rounded-[56px] bg-brand-500/10 blur-[64px] dark:bg-brand-500/20"
          />
          <AppPreview />
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-shell/55">
          <span>Trusted by 1,200+ Nigerian teams</span>
          <span className="hidden sm:inline">·</span>
          <span>₦12M+ spend optimised this week</span>
          <span className="hidden sm:inline">·</span>
          <span>142 automations fired in the last hour</span>
        </div>
      </div>
    </section>
  );
}

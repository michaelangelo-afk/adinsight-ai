"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { dashboardSummary } from "@/lib/mock-data";
import { formatDelta, formatNaira, formatPercent } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BadgeCheck,
  Sparkles,
  Zap,
  CircleDot
} from "lucide-react";
import { AuroraOrbsBackground } from "@/components/motion/aurora-orbs-background";
import { ParticleField } from "@/components/motion/particle-field";
import { AnimatedIcon3D } from "@/components/motion/animated-icon-3d";
import { MagneticCTA } from "@/components/motion/magnetic-cta";
import { motion } from "framer-motion";

const PLATFORMS = [
  { name: "Meta", short: "M", tone: "#1877F2", lightText: false },
  { name: "Google", short: "G", tone: "#EA4335", lightText: false },
  { name: "TikTok", short: "T", tone: "#0F0F0F", lightText: false },
  { name: "X", short: "X", tone: "#0F0F0F", lightText: false },
  { name: "LinkedIn", short: "in", tone: "#0A66C2", lightText: false },
  { name: "Snapchat", short: "Sc", tone: "#FFFC00", lightText: true }
];

function MiniMetric({
  label,
  value,
  delta,
  positive
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div
      className="
        rounded-xl bg-white border border-mist-200 shadow-card-flat p-4
        dark:bg-ink-900 dark:border-ink-700 dark:shadow-card-flat-dark
      "
    >
      <div
        className="
          text-[11px] uppercase tracking-wider font-semibold
          text-mist-500 dark:text-mist-400
        "
      >
        {label}
      </div>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-lg font-semibold text-mist-600 dark:text-mist-100">
          {value}
        </span>
        {delta && (
          <span
            className={
              "text-[11px] font-semibold flex items-center gap-1 " +
              (positive ? "text-violet-700 dark:text-violet-400" : "text-rose-500 dark:text-rose-400")
            }
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function PlatformsStrip() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="
          text-[11px] uppercase tracking-wider font-semibold mr-1
          text-mist-500 dark:text-mist-400
        "
      >
        Connected
      </span>
      {PLATFORMS.map((p) => (
        <div
          key={p.name}
          className="
            inline-flex items-center gap-1.5 rounded-md px-2 py-1
            bg-mist-100 border border-mist-200
            dark:bg-ink-850 dark:border-ink-700
          "
          title={`${p.name} — synced`}
        >
          <span
            className={
              "inline-flex items-center justify-center h-4 w-4 rounded text-[9px] font-bold " +
              (p.lightText ? "text-black" : "text-white")
            }
            style={{ background: p.tone }}
            aria-hidden
          >
            {p.short}
          </span>
          <span className="text-[11px] font-semibold text-mist-600 dark:text-mist-200">
            {p.name}
          </span>
          <CircleDot size={10} className="text-violet-600 dark:text-violet-400" />
        </div>
      ))}
    </div>
  );
}

function AutomationTile() {
  return (
    <div
      className="
        mt-4 rounded-xl p-4 flex items-start gap-3
        bg-violet-700/[0.04] border border-violet-700/20
        dark:bg-violet-700/[0.08] dark:border-violet-700/30
      "
    >
      <div
        className="
          mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg
          bg-violet-700/15 dark:bg-violet-700/20
        "
      >
        <Zap size={14} className="text-violet-700 dark:text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-mist-600 dark:text-mist-100">
            Auto-pause: Instagram Story ads when CPC &gt; ₦400
          </span>
          <span
            className="
              chip bg-violet-700/10 border border-violet-700/30 text-violet-700
              dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
              text-[10px]
            "
          >
            <CircleDot size={8} className="text-violet-600 dark:text-violet-400" />
            Active · triggered 3× this week
          </span>
        </div>
        <p className="text-xs text-mist-600 dark:text-mist-400 mt-1">
          Saved an estimated ₦62,400 in stalled spend. Reinvested automatically
          into your best-performing Lagos campaign.
        </p>
      </div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative group">
      <div className="absolute -inset-8 -z-10 bg-glow-emerald blur-3xl opacity-80 dark:opacity-60 animate-pulse-soft" />
      <div
        className="
          rounded-3xl bg-white border border-mist-200 shadow-card-elevated p-5 md:p-6
          dark:bg-ink-900 dark:border-ink-700 dark:shadow-card-elevated-dark
          hover-lift
        "
      >
        {/* Topbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Logo showWordmark={false} />
            <span className="text-xs font-semibold text-mist-500 dark:text-mist-400">
              / Performance overview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="
                chip bg-mist-100 border border-mist-200 text-mist-600
                dark:bg-ink-850 dark:border-ink-700 dark:text-mist-200
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-[pulse-soft_1.2s_ease-in-out_infinite]" />
              Live · last 30 days
            </span>
            <span
              className="
                chip bg-violet-700/10 border border-violet-700/30 text-violet-700 dark:text-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10
                dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
                text-[11px]
              "
            >
              + 1 rule running
            </span>
          </div>
        </div>

        {/* Connected platforms strip */}
        <div
          className="
            rounded-xl bg-surface-100 border border-mist-200 p-3 mb-4
            dark:bg-ink-850 dark:border-ink-700
          "
        >
          <PlatformsStrip />
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniMetric
            label="Total spend"
            value={formatNaira(dashboardSummary.totalSpend)}
            delta={formatDelta(dashboardSummary.spendDelta)}
            positive={dashboardSummary.spendDelta < 0}
          />
          <MiniMetric
            label="Conversions"
            value={dashboardSummary.totalConversions.toLocaleString()}
            delta={formatDelta(dashboardSummary.conversionsDelta)}
            positive
          />
          <MiniMetric
            label="Avg CPC"
            value={`₦${dashboardSummary.averageCpc.toFixed(2)}`}
            delta={formatDelta(Math.abs(dashboardSummary.cpcDelta))}
            positive
          />
          <MiniMetric
            label="ROI"
            value={`${dashboardSummary.roi.toFixed(2)}x`}
            delta={formatDelta(dashboardSummary.roiDelta)}
            positive
          />
        </div>

        {/* Trend chart preview */}
        <div
          className="
            mt-5 rounded-xl bg-surface-100 border border-mist-200 p-5
            dark:bg-ink-850 dark:border-ink-700
          "
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-mist-600 dark:text-mist-100">
                Spend vs. conversions
              </div>
              <div className="text-xs font-medium text-mist-500 dark:text-mist-400">
                Across all connected platforms
              </div>
            </div>
            <span
              className="
                chip bg-violet-700/10 border border-violet-700/30 text-violet-700 dark:text-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10
                dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
              "
            >
              {formatPercent(0.184, 1)} MoM uplift
            </span>
          </div>
          <PreviewSpark />
        </div>

        {/* Automation tile */}
        <AutomationTile />
      </div>
    </div>
  );
}

function PreviewSpark() {
  const data = dashboardSummary.trend;
  const max = Math.max(...data.map((d) => d.spend));
  const min = Math.min(...data.map((d) => d.spend));
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.spend - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="w-full h-20"
      role="img"
      aria-label="Spend trend"
    >
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill="url(#spark)"
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#15803D"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating glassmorphic "Live Activity" toast. */
function LiveActivityToast() {
  return (
    <div
      aria-hidden
      className="
        hidden lg:flex absolute -left-6 top-12 z-20 max-w-[260px]
        animate-fade-up
      "
      style={{
        animationDelay: "600ms",
        animationFillMode: "both"
      }}
    >
      <div className="animate-float" style={{ animationDelay: "600ms" }}>
        <div
          className="
            rounded-xl backdrop-blur-md p-3 flex items-start gap-3
            bg-white/95 border border-mist-200 shadow-card-elevated
            dark:bg-ink-900/95 dark:border-ink-700 dark:shadow-card-elevated-dark
          "
        >
          <span
            className="
              relative inline-flex h-8 w-8 items-center justify-center rounded-lg
              bg-violet-700/15 dark:bg-violet-700/20
            "
          >
            <Zap size={14} className="text-violet-700 dark:text-violet-300" />
            <span className="absolute inset-0 rounded-lg bg-violet-700/15 animate-ping" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500 dark:text-mist-400">
                Auto-rule fired
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-[pulse-soft_1.2s_ease-in-out_infinite]" />
            </div>
            <div className="mt-0.5 text-[13px] font-semibold text-mist-600 dark:text-mist-100 leading-snug">
              Paused 2 ads · saved ₦24,800
            </div>
            <div className="text-[11px] font-medium text-mist-500 dark:text-mist-400 mt-0.5">
              2 min ago · Lagos campaign
            </div>
          </div>
        </div>

        {/* Soft connector line tying the toast to the dashboard preview */}
        <svg
          aria-hidden
          className="absolute -right-6 top-9 pointer-events-none"
          width="28"
          height="14"
          viewBox="0 0 28 14"
          fill="none"
        >
          <path
            d="M 0 7 L 28 7"
            stroke="rgb(21 128 61 / 0.4)"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="animate-dash-flow"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/** Premium hero background — four drifting emerald orbs + grain. */
function MeshBackground() {
  return <AuroraOrbsBackground variant="light" />;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <MeshBackground />

      {/* Decorative scattered leaves backdrop */}
      <svg
        aria-hidden
        className="
          absolute top-32 right-[8%] w-16 h-16 -z-10 hidden md:block
          text-violet-700/[0.07] dark:text-violet-400/[0.06]
          animate-[float_8s_ease-in-out_infinite]
        "
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 4 C 50 10, 60 22, 60 38 C 60 50, 50 60, 32 60 C 14 60, 4 50, 4 38 C 4 22, 14 10, 32 4 Z" />
        <path d="M32 8 L 32 56" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
      </svg>
      <svg
        aria-hidden
        className="
          absolute bottom-24 left-[5%] w-10 h-10 -z-10 hidden md:block
          text-violet-700/[0.05] dark:text-violet-400/[0.04]
          animate-[float_10s_ease-in-out_infinite_0.5s]
        "
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 8 C 50 14, 58 24, 58 38 C 58 50, 50 58, 32 58 C 14 58, 6 50, 6 38 C 6 24, 14 14, 32 8 Z" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <span
              className="
                chip
                bg-violet-700/10 border border-violet-700/30 text-violet-700
                dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
                mb-6
              "
            >
              <Sparkles size={12} />
              Built for Nigerian SMEs running Meta, Google &amp; TikTok
            </span>

            {/* Staggered headline reveal — each line fades up in sequence */}
            <h1
              className="
                text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]
                text-mist-600 dark:text-mist-50
              "
            >
              <span
                className="block animate-fade-up"
                style={{ animationDelay: "0ms", animationFillMode: "both" }}
              >
                Plant money on ads
              </span>
              <span
                className="block animate-fade-up"
                style={{ animationDelay: "120ms", animationFillMode: "both" }}
              >
                that <span className="gradient-text">grow.</span>
              </span>
              <span
                className="block animate-fade-up"
                style={{ animationDelay: "240ms", animationFillMode: "both" }}
              >
                Automate the rest.
              </span>
            </h1>

            <p
              className="
                mt-6 text-base md:text-lg leading-relaxed max-w-xl animate-fade-up
                text-mist-600 dark:text-mist-300
              "
              style={{ animationDelay: "360ms", animationFillMode: "both" }}
            >
              GrowthAds is the dashboard for every naira you spend on paid ads.
              Track performance across Meta, Google, and TikTok, deploy campaigns
              anywhere from a single screen, and let rule-based automations kill
              bad ads and rebalance your budget while you sleep.
            </p>

      <div
        className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-up w-full sm:w-auto"
        style={{ animationDelay: "480ms", animationFillMode: "both" }}
      >
              <MagneticCTA>
                <LinkButton
                  href="/dashboard"
                  variant="primary"
                  size="lg"
                  className="shadow-glow-emerald shadow-[0_0_50px_-5px_rgba(16,185,129,0.55)] hover:shadow-[0_0_60px_-5px_rgba(16,185,129,0.8)] touch-target group"
                >
                  Start free 14-day trial
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </LinkButton>
              </MagneticCTA>
              <LinkButton href="#workflow" variant="secondary" size="lg">
                See how it works
              </LinkButton>
            </div>

            <div
              className="
                mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm animate-fade-up
                text-mist-600 dark:text-mist-300
              "
              style={{ animationDelay: "600ms", animationFillMode: "both" }}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-violet-600 dark:text-violet-400" />
                No credit card needed
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-violet-600 dark:text-violet-400" />
                Live in under 10 minutes
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-violet-600 dark:text-violet-400" />
                Paystack-billed in Naira
              </div>
            </div>
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "120ms", animationFillMode: "both" }}
          >
            <LiveActivityToast />
            {/* Orbiting badge floating above the dashboard preview — adds a
                motion-path anchor above the HeroPreview. */}
            <motion.div
              className="absolute -top-6 -right-6 z-20 hidden lg:block"
              animate={{
                y: [0, -6, 0],
                rotate: [-3, 3, -3]
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="rounded-full bg-violet-700/15 border border-violet-700/30 px-3 py-1.5 shadow-[0_0_20px_-2px_rgba(16,185,129,0.55)] backdrop-blur-md dark:bg-violet-700/20 dark:border-violet-700/30">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  LIVE
                </span>
              </div>
            </motion.div>
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

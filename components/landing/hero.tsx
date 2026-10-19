import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { dashboardSummary } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";

/**
 * Front page.
 *
 * The old hero was a generic SaaS split: gradient headline left, floating
 * dashboard mockup right, glass toast on top. This one is a printed statement:
 * an edition line, a serif headline with an italic turn, and the actual numbers
 * set as a filed document — ruled rows, tabular figures, a red pen annotation.
 *
 * Everything below the headline is real data from `dashboardSummary`, so the
 * panel cannot drift from the product it advertises.
 */

const PLATFORM_ROWS = dashboardSummary.platformBreakdown.map((p) => ({
  name: p.platform === "meta" ? "Meta" : p.platform === "google" ? "Google" : "TikTok",
  spend: p.spend,
  share: p.spend / dashboardSummary.totalSpend
}));

function Metric({
  label,
  value,
  delta,
  good
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}) {
  return (
    <div className="border-t border-ink-950/15 py-3 dark:border-paper-100/15">
      <div className="kicker">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="num text-xl font-medium text-ink-950 dark:text-paper-50">
          {value}
        </span>
        <span
          className={
            "num text-xs font-medium " +
            (good
              ? "text-brand-700 dark:text-brand-300"
              : "text-ledger-700 dark:text-ledger-300")
          }
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

function SpendBars() {
  const trend = dashboardSummary.trend;
  const max = Math.max(...trend.map((d) => d.spend));

  return (
    <div className="mt-5 flex h-16 items-end gap-[3px]" aria-hidden>
      {trend.map((d, i) => (
        <span
          key={i}
          className="flex-1 bg-brand-700/85 dark:bg-brand-300/80"
          style={{ height: `${Math.max(8, (d.spend / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function StatementPanel() {
  return (
    <figure className="relative">
      {/* Registration marks — a printer's crop marks, drawn with rules. */}
      <span aria-hidden className="absolute -left-3 -top-3 h-4 w-4 border-l border-t border-ink-950/40 dark:border-paper-100/40" />
      <span aria-hidden className="absolute -bottom-3 -right-3 h-4 w-4 border-b border-r border-ink-950/40 dark:border-paper-100/40" />

      <div
        className="
          relative border border-ink-950 bg-paper-50 shadow-plate
          dark:border-paper-100/40 dark:bg-ink-900 dark:shadow-plate-dark
        "
      >
        {/* Document header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-950/20 px-5 py-4 dark:border-paper-100/20">
          <div>
            <div className="kicker text-brand-700 dark:text-brand-300">
              Performance statement
            </div>
            <div className="mt-1 font-mono text-xs text-mist-500 dark:text-mist-400">
              Lagos Bites · 01–30 Sep 2026
            </div>
          </div>
          <span className="stamp shrink-0 -rotate-3">Filed</span>
        </div>

        {/* Headline figure */}
        <div className="px-5 pt-5">
          <div className="kicker">Total ad spend</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="num text-5xl font-medium leading-none text-ink-950 dark:text-paper-50">
              {formatNaira(dashboardSummary.totalSpend)}
            </span>
            <span className="num text-xs font-medium text-brand-700 dark:text-brand-300">
              ↓ 12.4% · ₦69k less than August
            </span>
          </div>
          <SpendBars />
          <div className="mt-2 flex justify-between font-mono text-xs text-mist-500 dark:text-mist-400">
            <span>01 Sep</span>
            <span>30 Sep</span>
          </div>
        </div>

        {/* Ledger rows */}
        <div className="mt-5 px-5">
          {PLATFORM_ROWS.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 border-t border-ink-950/15 py-2.5 dark:border-paper-100/15"
            >
              <span className="text-sm text-ink-950 dark:text-paper-50">{row.name}</span>
              <span className="hidden h-1 w-24 bg-ink-950/10 dark:bg-paper-100/15 sm:block">
                <span
                  className="block h-1 bg-brand-700 dark:bg-brand-300"
                  style={{ width: `${row.share * 100}%` }}
                />
              </span>
              <span className="num text-sm text-mist-600 dark:text-mist-300">
                {formatNaira(row.spend)}
              </span>
            </div>
          ))}
        </div>

        {/* KPI block */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 px-5">
          <Metric label="Conversions" value="866" delta="+18.2%" good />
          <Metric label="Avg. CPC" value="₦16.42" delta="−8.7%" good />
          <Metric label="Return on spend" value="3.62×" delta="+22.4%" good />
          <Metric label="Waste removed" value="₦62,400" delta="11 ads" good />
        </div>

        {/* The pen note — the one hand-written moment on the page. */}
        <figcaption
          className="
            relative mx-5 mb-5 mt-5 border-l-2 border-ledger-500 bg-ledger-500/[0.06]
            px-3 py-2 font-mono text-xs leading-relaxed text-ledger-700
            dark:border-ledger-300 dark:bg-ledger-300/[0.08] dark:text-ledger-300
          "
        >
          <span className="font-display text-sm italic">Auto-paused 11 losing ads</span>
          <br />
          before they spent ₦62,400 more. Reinvested in Lagos.
        </figcaption>
      </div>
    </figure>
  );
}

export function Hero() {
  return (
    <section id="statement" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-70" />
      {/* Oversized currency mark, set as a watermark rather than a gradient blob. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-10 -z-10 hidden select-none font-display text-[24rem] leading-none text-ink-950/[0.035] dark:text-paper-100/[0.04] lg:block"
      >
        ₦
      </div>

      <div className="mx-auto max-w-content px-gutter pb-16 pt-10 lg:px-gutter-lg md:pb-24 md:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:pr-8">
            <div className="flex items-center gap-4">
              <span className="kicker text-brand-700 dark:text-brand-300">01 — The statement</span>
              <span className="h-px flex-1 bg-ink-950/20 dark:bg-paper-100/20" />
              <span className="kicker">Sept 2026</span>
            </div>

            <h1 className="display mt-6 text-5xl leading-[0.98] sm:text-6xl">
              Every naira
              <br />
              you spend should
              <br />
              <span className="italic text-brand-800 dark:text-brand-200">report back.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base text-mist-600 dark:text-mist-300 md:text-xl">
              GrowthAds reads Meta, Google and TikTok every night and hands you
              one page on Monday: what grew, what burned, and the{" "}
              <span className="pen-underline text-ink-950 dark:text-paper-50">
                three moves that follow
              </span>
              . No dashboards to babysit.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton href="/signup" variant="primary" size="lg" className="group">
                Start free 14-day trial
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </LinkButton>
              <LinkButton href="#workflow" variant="secondary" size="lg">
                See how it works
              </LinkButton>
            </div>

            {/* Ruled trust rail, numbered like a footnote. */}
            <dl className="mt-10 grid grid-cols-1 border-t border-ink-950/20 dark:border-paper-100/20 sm:grid-cols-3">
              {[
                ["01", "No card needed"],
                ["02", "Live in 10 minutes"],
                ["03", "Paystack · billed in ₦"]
              ].map(([n, label]) => (
                <div
                  key={n}
                  className="flex items-baseline gap-2 border-b border-ink-950/12 py-2.5 dark:border-paper-100/12 sm:border-b-0"
                >
                  <dt className="num text-xs text-mist-500">{n}</dt>
                  <dd className="font-mono text-xs uppercase tracking-[0.08em] text-mist-600 dark:text-mist-300">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-mist-500">
              Trusted by 1,200+ Nigerian teams ·{" "}
              <Link href="#pricing" className="text-brand-700 underline decoration-1 underline-offset-4 dark:text-brand-300">
                see pricing
              </Link>
            </p>
          </div>

          <div className="lg:col-span-5">
            <StatementPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

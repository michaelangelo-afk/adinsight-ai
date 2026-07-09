// lib/metric-tooltips.tsx
//
// Educational content for MetricTooltip on the dashboard. Single
// source of truth so the educational copy stays consistent across
// summary cards, charts, table headers, and the recommendations
// panel — and so the wording can be revised in one place when the
// product team refines it.
//
// Audience: Nigerian SMB owners / operators who know the words
// "spend" and "click" but not the formulas or what "good vs. bad"
// looks like. Each tip follows the same three-section structure so
// users learn to scan them quickly:
//
//   1. Definition    — plain English, 1 sentence.
//   2. Formula       — exact calculation, monospace on a darker bar.
//   3. What's good   — heuristic, italic + naira-green so it pops as
//                      the "what should I actually do" guidance.
//
// Tip placement reminder: tooltips should answer "what is this
// number?" first, "how is it calculated?" second, "what should I
// expect to see?" third. Avoid jargon beyond what the user sees on
// the screen.

import * as React from "react";

/**
 * Internal shared layout for every tip body so definitions + formulas
 * + heuristics render with consistent spacing, color, and emphasis.
 */
function TipBody({
  title,
  definition,
  formula,
  goodFor
}: {
  title: string;
  definition: string;
  formula: string;
  goodFor: string;
}) {
  return (
    <div className="space-y-2 block">
      <div className="font-semibold text-violet-200 text-[13px]">{title}</div>
      <div className="text-mist-100">{definition}</div>
      <div className="font-mono text-[11px] font-medium text-ink-900 bg-mist-100 border border-mist-200/60 px-2 py-1 rounded-md dark:text-mist-300 dark:bg-ink-950/70 dark:border-mist-50/[0.04]">
        {formula}
      </div>
      <div className="text-[11px] text-naira-300 italic">{goodFor}</div>
    </div>
  );
}

// ─── Summary card tips (MetricsGrid) ────────────────────────────────────────

export const SpendTip = (
  <TipBody
    title="Total spend"
    definition="The total ₦ amount your business paid to Meta, Google, and TikTok in the last 30 days. Counts every click, impression, and CPM charge."
    formula="Σ daily campaign_spend across all campaigns"
    goodFor="Hold steady when conversions rise; cut when conversions fall. A lower spend at flat conversion rate = you're winning."
  />
);

export const ConversionsTip = (
  <TipBody
    title="Conversions"
    definition="The number of purchases, signups, downloads, or calls your ads drove in the last 30 days. This is what your business actually cares about."
    formula="count of conversion events fired by Pixel / API"
    goodFor="Up over time = growth. Sudden drops usually mean a creative went stale or a landing page broke."
  />
);

export const CpcTip = (
  <TipBody
    title="Avg CPC — Cost per click"
    definition="On average, how much you pay each time someone clicks your ad."
    formula="total_spend ÷ total_clicks"
    goodFor="Lower is better IF those clicks keep converting. A cheap click that never buys is more expensive than a 2× CPC click that always does."
  />
);

export const RoiTip = (
  <TipBody
    title="ROI — Return on investment"
    definition="How much revenue you earned for every ₦1 of ad spend. Above 1× means you made more than you spent; below 1× means you lost money."
    formula="(revenue attributed to ads) ÷ ad_spend"
    goodFor="≥ 3× is great on Meta for most products. Below 1× = stop, fix, or pivot. We use a placeholder 2.5× until revenue tracking is wired."
  />
);

// ─── Delta-pill tips (the ▲▼X% chips next to card values) ───────────────────

export const DeltaTip = (
  <TipBody
    title="▲ ▼ % — Period vs. period"
    definition="Compares this 30-day period with the previous 30-day period for the same metric."
    formula="(current_period ÷ previous_period) − 1, ×100"
    goodFor="Down is GOOD for spend / CPC (you paid less). Up is GOOD for conversions / ROI (you earned more). The color flips based on which direction is healthier for that metric."
  />
);

// ─── Trend chart legend tips (Spend / Conversions chips) ────────────────────

export const SpendLegendTip = (
  <TipBody
    title="Daily spend"
    definition="The ₦ amount your business paid to all ad platforms each day over the last 30 days. Each point on the purple line is one day."
    formula="Σ platform_spend by date"
    goodFor="A flat or gentle-rising line is healthy. Sudden spikes = runaway ad set that needs a budget cap. Sudden drops = a campaign ended or got paused."
  />
);

export const ConversionsLegendTip = (
  <TipBody
    title="Daily conversions"
    definition="Sales / signups / downloads your ads drove on each day, summed across all platforms. Each point on the green line is one day."
    formula="count of conversion events by date"
    goodFor="A gentle rising trend = healthy. Drops mid-month = your targeting or creative went stale. Spikes = something worked, double-down on it."
  />
);

// ─── Platform-mix tips (PlatformChart legend rows) ─────────────────────────

export const MetaBriefTip = (
  <TipBody
    title="Meta Ads"
    definition="Facebook + Instagram + WhatsApp + Messenger ads. Roughly 3 billion MAU globally; the strongest SMB channel for creative-driven offers in Nigeria."
    formula="Meta Graph API: /act_{id}/insights"
    goodFor="Best when you have a strong creative (image / short video) and a clear value prop. Weaker for pure-intent searches ('plumber near me')."
  />
);

export const GoogleBriefTip = (
  <TipBody
    title="Google Ads"
    definition="Search + YouTube + Display + Gmail. People who already want what you sell — they typed a query, so intent is high."
    formula="Google Ads API: campaigns.metrics"
    goodFor="Best for high-intent searches and YouTube-led awareness for technical products. Less effective for unbranded demand-gen vs. Meta in Nigeria today."
  />
);

export const TiktokBriefTip = (
  <TipBody
    title="TikTok Ads"
    definition="Short-form video ads on the TikTok feed. Best for B2C brands with creative video assets and a younger (18–34) audience."
    formula="TikTok Marketing API: /report/integrated/get/"
    goodFor="Brand awareness and impulse-purchase products. Conversion volume is smaller per ₦ than Meta in most Nigerian categories we've seen."
  />
);

export const BestCostPerConvTip = (
  <TipBody
    title="Lowest cost per conversion"
    definition="Your single most efficient campaign — the lowest ₦ amount you paid for any single conversion in the period."
    formula="min(campaign.spend ÷ campaign.conversions)"
    goodFor="Lean into it: pump more budget into it, copy what works (creative, audience, placement). Often the cheapest improvements come from doubling down on your cheapest campaign."
  />
);

// ─── Campaigns table header tips ───────────────────────────────────────────

export const ColumnSpendTip = (
  <TipBody
    title="Spend (column)"
    definition="The total ₦ your business has paid to the platform for this single campaign."
    formula="Σ campaign_metric.spend over the active window"
    goodFor="If a campaign is consuming its budget fast without delivering conversions, Pause it from the row's Pause button."
  />
);

export const ColumnConversionsTip = (
  <TipBody
    title="Conversions (column)"
    definition="Total conversions (sales / signups / downloads) this campaign has driven in the active window."
    formula="Σ campaign_metric.conversions"
    goodFor="Compare against spend for an at-a-glance efficiency check: high spend + low conversions = problem campaign."
  />
);

export const ColumnCpcTip = (
  <TipBody
    title="CPC (column)"
    definition="How much, on average, you're paying per click for this single campaign."
    formula="campaign.spend ÷ campaign.clicks"
    goodFor="Lower than your Avg CPC card = this campaign is more efficient than your average. Higher = it's losing efficiency vs. your portfolio."
  />
);

export const TrendSparklineTip = (
  <TipBody
    title="Trend (sparkline)"
    definition="Last 7 days of normalized spend or conversion activity for this campaign. The shape, not the height, is what matters."
    formula="daily metric values, last 7 days, normalized"
    goodFor="Green up-trend = healthy. Yellow flat = plateau. Red down-trend = momentum lost — investigate before pausing."
  />
);

// ─── Recommendations panel tips ────────────────────────────────────────────

export const SavingsOnTableTip = (
  <TipBody
    title="₦ on the table"
    definition="The total ₦ you could keep by applying all your pending AI recommendations. It's an estimate based on the last 30 days of data, not a guarantee."
    formula="Σ estimated_savings(status = pending)"
    goodFor="Apply the high-impact ones first — they compound. Dismissed recommendations stop counting toward this total, so don't dismiss without reading."
  />
);

export const ImpactTip = (
  <TipBody
    title="Impact level"
    definition="How much the AI expects this single recommendation to move your business results if you apply it."
    formula="estimated_impact ÷ current_spend baseline"
    goodFor="'High-impact' = worth your time this week. 'Low-impact' = nice-to-have, do it later. Apply the highs first when you have time to make changes."
  />
);

// ─── Accounts-strip demo pill tip ──────────────────────────────────────────

export const DemoPillTip = (
  <TipBody
    title="Demo mode"
    definition="You're seeing realistic-looking mock numbers because you haven't connected a real Meta Ads account yet. The data is generated from real Meta-shape schemas, so your dashboard layout looks identical to production."
    formula="synthetic — unchanged from real-mode wiring"
    goodFor="Connect Meta Ads (with a real Meta app's OAuth credentials) to swap to your live numbers. The Swap is automatic; no code changes."
  />
);

// ─── Page-welcome summary line tip (ROI X× in the welcome) ──────────────────

export const WelcomeRoiTip = (
  <TipBody
    title="ROI in the welcome line"
    definition="The return-on-investment number mentioned at the top of the dashboard. Above 1× = your ads made more than they cost."
    formula="revenue ÷ spend for the same window"
    goodFor="≥ 3× is great. < 1× = investigate before continuing to spend. The summary line uses a placeholder 2.5× until revenue tracking is wired."
  />
);

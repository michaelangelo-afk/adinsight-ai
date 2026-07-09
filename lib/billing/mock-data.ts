// lib/billing/mock-data.ts
//
// Phase 5 — mock invoice + plan + usage data for the brand at the
// "Pro" tier. Deterministic (no Date.now / Math.random) so SSR and
// first client render agree.

import type { Invoice, Plan, UsageMetric } from "@/lib/types";

/**
 * Plan catalog. "Pro" is the current subscription tier for Lagos
 * Bites; the Pricing card will highlight it on /billing.
 */
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    perks: [
      "1 connected ad account",
      "30-day dashboard history",
      "Up to 3 AI recommendations / month"
    ],
    limits: {
      campaignsMax: 5,
      recommendationsPerMonth: 3,
      seatsIncluded: 1
    }
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 24_000,
    priceAnnual: 240_000,
    perks: [
      "3 connected ad accounts",
      "90-day dashboard history",
      "Up to 30 AI recommendations / month",
      "Email reports (weekly)"
    ],
    limits: {
      campaignsMax: 25,
      recommendationsPerMonth: 30,
      seatsIncluded: 2
    }
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 75_000,
    priceAnnual: 720_000,
    badge: "Most popular",
    perks: [
      "Unlimited ad accounts",
      "12-month dashboard history",
      "Up to 250 AI recommendations / month",
      "Daily + weekly email reports",
      "Creator marketplace access",
      "Priority AI insights + ROI ladder"
    ],
    limits: {
      campaignsMax: 250,
      recommendationsPerMonth: 250,
      seatsIncluded: 5
    }
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 220_000,
    priceAnnual: 2_160_000,
    perks: [
      "Everything in Pro",
      "Dedicated success manager",
      "API access + webhooks",
      "White-label reports",
      "Unlimited seats",
      "Custom AI training on your account"
    ],
    limits: {
      campaignsMax: 5000,
      recommendationsPerMonth: 2500,
      seatsIncluded: 25
    }
  }
];

/** Current plan Lagos Bites is on. */
export const currentPlan: Plan = plans.find((p) => p.id === "pro")!;

/**
 * Recent invoices. Realistic gap from the canonical 2026 timeline
 * dates we've used throughout the project.
 */
export const invoices: Invoice[] = [
  {
    id: "inv_2026_07_01",
    date: "2026-07-01T09:00:00Z",
    amount: 75_000,
    status: "paid",
    description: "Pro · Monthly subscription · July 2026",
    pdfUrl: "/api/invoices/inv_2026_07_01.pdf"
  },
  {
    id: "inv_2026_06_01",
    date: "2026-06-01T09:00:00Z",
    amount: 75_000,
    status: "paid",
    description: "Pro · Monthly subscription · June 2026",
    pdfUrl: "/api/invoices/inv_2026_06_01.pdf"
  },
  {
    id: "inv_2026_05_01",
    date: "2026-05-01T09:00:00Z",
    amount: 75_000,
    status: "paid",
    description: "Pro · Monthly subscription · May 2026",
    pdfUrl: "/api/invoices/inv_2026_05_01.pdf"
  },
  {
    id: "inv_2026_07_extra",
    date: "2026-07-12T09:00:00Z",
    amount: 12_000,
    status: "due",
    description: "Creator marketplace · 1 additional seat add-on",
    pdfUrl: "/api/invoices/inv_2026_07_extra.pdf"
  }
];

/** Live usage metrics for the current Pro plan cycle. */
export const usageMetrics: UsageMetric[] = [
  {
    id: "u_camp",
    label: "Active campaigns",
    used: 6,
    total: currentPlan.limits.campaignsMax,
    unit: "campaigns",
    hint: "Across Meta, Google and TikTok"
  },
  {
    id: "u_rec",
    label: "AI recommendations used",
    used: 178,
    total: currentPlan.limits.recommendationsPerMonth,
    unit: "recs",
    hint: "Resets on Aug 1, 2026"
  },
  {
    id: "u_rep",
    label: "Reports sent this cycle",
    used: 4,
    total: 8,
    unit: "reports",
    hint: "Weekly cadence — next run Sun 02:00"
  },
  {
    id: "u_creator",
    label: "Creators shortlisted",
    used: 12,
    total: 50,
    unit: "creators",
    hint: "LocalStorage-backed list"
  }
];

/** Aggregate stats used by the page hero KPI strip. */
export interface BillingStats {
  monthlySpend: number; // current month's billable spend
  payDate: string; // ISO — next billing date
  daysUntilRenewal: number; // computed at render time, deterministic here
  savedYtd: number; // savings from applied recommendations YTD
}

export function billingStats(now: Date = new Date("2026-07-09")): BillingStats {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const days = Math.max(
    0,
    Math.ceil((next.getTime() - now.getTime()) / (24 * 3600 * 1000))
  );
  return {
    monthlySpend: 75_000,
    payDate: next.toISOString(),
    daysUntilRenewal: days,
    savedYtd: 198_400 // Lagos Bites applied recs this year = ₦198k saved
  };
}

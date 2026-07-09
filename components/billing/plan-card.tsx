// components/billing/plan-card.tsx
//
// Server-rendered plan card. Two flavors:
//  - "current" : the user's existing subscription; large card with
//                perks checklist + usage summary footer + CTA.
//  - "tier"    : display only; small card for the pricing matrix.

import {
  Check,
  Sparkles,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDelta } from "@/lib/utils";
import type { Plan } from "@/lib/types";

const TIER_GLOW: Record<Plan["id"], string> = {
  free: "rgba(148,163,184,0.30)",
  starter: "rgba(96,165,250,0.30)",
  pro: "rgba(16,185,129,0.40)",
  scale: "rgba(167,139,250,0.40)"
};

const TIER_BG: Record<Plan["id"], string> = {
  free: "from-mist-50/[0.04] to-mist-50/[0.02]",
  starter: "from-blue-500/[0.06] to-blue-500/[0.02]",
  pro: "from-emerald-500/[0.10] to-emerald-500/[0.02]",
  scale: "from-violet-500/[0.10] to-violet-500/[0.02]"
};

export function CurrentPlanCard({
  plan,
  interval,
  renewalDate,
  daysUntilRenewal
}: {
  plan: Plan;
  interval: "monthly" | "annual";
  renewalDate: string;
  daysUntilRenewal: number;
}) {
  return (
    <article
      className="glass-card rounded-2xl p-6 sm:p-7 hover-lift animate-fade-up relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${TIER_BG[plan.id]}, transparent)`
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl"
        style={{ background: TIER_GLOW[plan.id] }}
      />
      <div className="relative">
        <Badge tone="good" className="!text-[10px]">
          <Sparkles size={10} className="mr-1" aria-hidden />
          Current
        </Badge>
        <h2 className="mt-3 text-2xl font-semibold text-mist-50 tracking-tight">
          {plan.name}{" "}
          <span className="text-mist-400 text-base font-normal">plan</span>
        </h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-mist-50 tabular-nums animate-count-up">
            {formatNaira(
              interval === "monthly" ? plan.priceMonthly : plan.priceAnnual / 12
            )}
          </span>
          <span className="text-sm text-mist-400">/ month</span>
          {interval === "annual" && (
            <Badge tone="violet">
              billed yearly · save ~17%
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-mist-400">
          Renews on{" "}
          <time dateTime={renewalDate}>
            {new Date(renewalDate).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </time>
          {" "}— in <strong className="text-mist-50">{daysUntilRenewal}d</strong>
        </p>

        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-wider text-mist-500 mb-2">
            What's included
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" role="list">
            {plan.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2 text-sm text-mist-200"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                >
                  <Check size={10} />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-mist-400">
            <div className="flex items-center gap-1.5">
              <CreditCard size={11} aria-hidden />
              {formatDelta(0).replace(/^[▲▼]\s*/, "")} saved vs Starter
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-mist-500">
              Limits ·{" "}
              {plan.limits.campaignsMax} campaigns ·{" "}
              {plan.limits.recommendationsPerMonth} recs/mo
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Manage payment
            </Button>
            <Button variant="primary" size="sm">
              <Sparkles size={11} aria-hidden />
              Upgrade plan
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PlanMatrixCard({
  plan,
  highlighted
}: {
  plan: Plan;
  highlighted?: boolean;
}) {
  return (
    <article
      className={
        "glass-card rounded-2xl p-5 hover-lift animate-fade-up relative overflow-hidden " +
        (highlighted ? "ring-1 ring-emerald-500/40" : "")
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `linear-gradient(135deg, ${TIER_BG[plan.id]}, transparent 60%)`
        }}
      />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-mist-50">
            {plan.name}
          </h3>
          {plan.badge && (
            <Badge tone="good">{plan.badge}</Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-mist-50 tabular-nums">
            {plan.priceMonthly === 0
              ? "Free"
              : `₦${(plan.priceMonthly / 1000).toFixed(0)}k`}
          </span>
          {plan.priceMonthly > 0 && (
            <span className="text-xs text-mist-400">/ month</span>
          )}
        </div>
        <ul className="space-y-1.5 text-xs text-mist-300" role="list">
          {plan.perks.slice(0, 4).map((perk) => (
            <li key={perk} className="flex items-start gap-2">
              <span
                aria-hidden
                className={"mt-0.5 h-1.5 w-1.5 rounded-full " + (highlighted ? "bg-emerald-400" : "bg-mist-400")}
              />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

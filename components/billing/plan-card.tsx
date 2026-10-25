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
import { formatNaira } from "@/lib/utils";
import type { Plan } from "@/lib/types";

/**
 * Plan cards are flat panels. The current plan gets one brand-tinted hairline
 * and a 4%-fill wash — no blurred glow, no gradient card background. Tier
 * identity is carried by the price and the badge, not by colour.
 */

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
  const price =
    interval === "monthly" ? plan.priceMonthly : plan.priceAnnual / 12;

  return (
    <article className="glass-card relative overflow-hidden rounded-xl p-5 sm:p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-brand-500/[0.09] blur-3xl"
      />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr),252px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="good">
              <Sparkles size={10} className="mr-1" aria-hidden />
              Current
            </Badge>
            <span className="text-[11px] text-mist-500">
              {interval === "annual" ? "Billed yearly" : "Billed monthly"} ·
              cancel any time
            </span>
          </div>

          <h2 className="mt-2.5 text-[19px] font-semibold tracking-tight text-mist-50">
            {plan.name}
            <span className="ml-1.5 text-[13px] font-normal text-mist-400">
              plan
            </span>
          </h2>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-mist-50 tabular-nums">
              {formatNaira(price)}
            </span>
            <span className="text-[12px] text-mist-400">/ month</span>
          </div>

          <p className="mt-1.5 text-[11.5px] text-mist-500">
            Renews on{" "}
            <time dateTime={renewalDate} className="text-mist-300">
              {new Date(renewalDate).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </time>{" "}
            — in <strong className="font-medium text-mist-100">{daysUntilRenewal}d</strong>
          </p>

          <div className="fade-rule my-4" />

          <div className="stat-label mb-2">What&apos;s included</div>
          <ul
            className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2"
            role="list"
          >
            {plan.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2 text-[12px] leading-relaxed text-mist-200"
              >
                <span
                  aria-hidden
                  className="mt-[2px] inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-brand-500/[0.14] text-brand-300 ring-1 ring-inset ring-brand-500/30"
                >
                  <Check size={9} strokeWidth={3} />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Billing rail — the facts the plan card used to bury in a footer. */}
        <aside className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 lg:border-0 lg:border-l lg:border-white/[0.07] lg:bg-transparent lg:py-0 lg:pl-6 lg:pr-0 lg:rounded-none">
          <div>
            <div className="stat-label">Next charge</div>
            <div className="mt-1 text-[15px] font-semibold tabular-nums text-mist-50">
              {formatNaira(price)}
            </div>
            <div className="mt-0.5 text-[10.5px] text-mist-500">
              Auto-renews in {daysUntilRenewal} days
            </div>
          </div>

          <div className="fade-rule lg:hidden" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="stat-label">Campaigns</div>
              <div className="mt-1 text-[12.5px] font-medium tabular-nums text-mist-100">
                {plan.limits.campaignsMax}
              </div>
            </div>
            <div>
              <div className="stat-label">Recs / mo</div>
              <div className="mt-1 text-[12.5px] font-medium tabular-nums text-mist-100">
                {plan.limits.recommendationsPerMonth}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <Button variant="outline" size="sm">
              <CreditCard size={11} aria-hidden />
              Manage payment
            </Button>
            <Button variant="primary" size="sm">
              <Sparkles size={11} aria-hidden />
              Upgrade plan
            </Button>
          </div>
        </aside>
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
        "relative flex h-full flex-col overflow-hidden rounded-xl p-4 " +
        (highlighted
          ? "border border-brand-500/30 bg-brand-500/[0.035]"
          : "glass-card panel-interactive")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-mist-50">
          {plan.name}
        </h3>
        {plan.badge && <Badge tone="good">{plan.badge}</Badge>}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.025em] text-mist-50 tabular-nums">
          {plan.priceMonthly === 0
            ? "Free"
            : `₦${(plan.priceMonthly / 1000).toFixed(0)}k`}
        </span>
        {plan.priceMonthly > 0 && (
          <span className="text-[11px] text-mist-500">/ month</span>
        )}
      </div>

      <div className="fade-rule my-3" />

      <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-mist-300" role="list">
        {plan.perks.slice(0, 4).map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <span
              aria-hidden
              className={
                "mt-[5px] h-1 w-1 shrink-0 rounded-full " +
                (highlighted ? "bg-brand-400" : "bg-mist-500")
              }
            />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={
          "mt-3 flex h-7 w-full items-center justify-center rounded-md text-[11px] font-semibold transition-colors " +
          (highlighted
            ? "bg-transparent text-mist-300 hover:bg-white/[0.05] hover:text-mist-50"
            : "border border-white/[0.09] text-mist-200 hover:border-brand-500/40 hover:text-brand-200")
        }
      >
        {highlighted ? "Current plan" : `Switch to ${plan.name}`}
      </button>
    </article>
  );
}

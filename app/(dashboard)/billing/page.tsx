// app/(dashboard)/billing/page.tsx
//
// Phase 5 — Billing route. Server-rendered.
//
// Sections:
//  1. Hero
//  2. CurrentPlanCard (Pro)
//  3. UsageMeters (4 tiles: campaigns, recs, reports, creator shortlist)
//  4. PlanMatrixCard row (Free / Starter / Pro / Scale)
//  5. InvoicesList

import {
  Wallet,
  Sparkles,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuroraOrbsBackground } from "@/components/motion/aurora-orbs-background";
import { TextureGrain } from "@/components/motion/texture-grain";

import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

import {
  currentPlan,
  invoices,
  plans,
  usageMetrics,
  billingStats
} from "@/lib/billing/mock-data";
import { formatNaira } from "@/lib/utils";

import {
  CurrentPlanCard,
  PlanMatrixCard
} from "@/components/billing/plan-card";
import {
  UsageMeter
} from "@/components/billing/usage-meter";
import {
  InvoicesList
} from "@/components/billing/invoice-list";

export default async function BillingPage() {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);
  const stats = billingStats();

  const profile = {
    avatar:
      user?.profile?.avatar ||
      (user?.profile?.full_name ?? "User")
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "?",
    fullName: user?.profile?.full_name ?? "User",
    businessName: orgName
  };

  return (
    <div className="relative flex-1 min-w-0 flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <AuroraOrbsBackground variant="dark" />
        <TextureGrain />
      </div>

      <Topbar profile={profile} />

      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Hero */}
        <section
          className="relative rounded-3xl overflow-hidden hairline bg-gradient-to-br from-violet-500/15 via-ink-950/60 to-emerald-500/15 p-6 sm:p-8 animate-fade-up"
          aria-label="Billing hero"
        >
          <div
            aria-hidden
            className="absolute inset-0 grid-bg opacity-30"
          />
          <div className="relative grid lg:grid-cols-[1.5fr,1fr] gap-6 items-center">
            <div>
              <Badge tone="good" className="!text-[10px]">
                <Wallet size={11} aria-hidden className="mr-1" />
                Phase 5 · Billing center
              </Badge>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-mist-50 leading-[1.05]">
                Pay for what{" "}
                <span className="gradient-text">moves the needle.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-mist-200 max-w-xl leading-relaxed">
                <strong className="text-mist-50">Lagos Bites</strong> is on
                the <em className="not-italic text-emerald-300">Pro</em>{" "}
                plan — ₦{currentPlan.priceMonthly.toLocaleString()}/mo with{" "}
                <strong className="text-mist-50">
                  ₦{stats.savedYtd.toLocaleString()}
                </strong>{" "}
                saved through applied recommendations this year.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 max-w-md text-[11px] text-mist-400">
                <KpiPill
                  label="Next bill"
                  value={`${stats.daysUntilRenewal}d`}
                />
                <KpiPill
                  label="Monthly"
                  value={formatNaira(currentPlan.priceMonthly)}
                />
                <KpiPill
                  label="Saved YTD"
                  value={`₦${(stats.savedYtd / 1000).toFixed(0)}k`}
                  highlight
                />
              </div>
            </div>

            <div className="hidden lg:flex justify-end items-center">
              <div className="relative h-44 w-44 rounded-full bg-emerald-500/[0.06] hairline flex items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-2 rounded-full bg-emerald-500/[0.10] animate-halo-breathing"
                />
                <CreditCard
                  size={64}
                  className="text-emerald-300 relative"
                  aria-hidden
                />
                <span
                  className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200"
                >
                  <Sparkles size={10} aria-hidden />
                  Pro
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI strip — quick at-a-glance */}
        <section
          aria-label="Billing KPIs"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiTile
            label="Next renewal"
            value={`${stats.daysUntilRenewal}d`}
            icon={<TrendingUp size={14} aria-hidden />}
            hint={`₦${currentPlan.priceMonthly.toLocaleString()} Pro · ${currentPlan.id === "pro" ? "renews" : "downgrade protection"}`}
            tone="naira"
          />
          <KpiTile
            label="Active seats"
            value={String(currentPlan.limits.seatsIncluded)}
            icon={<Sparkles size={14} aria-hidden />}
            hint="Including you + 4 collaborators"
            tone="violet"
          />
          <KpiTile
            label="YTD savings"
            value={`₦${(stats.savedYtd / 1000).toFixed(0)}k`}
            icon={<Wallet size={14} aria-hidden />}
            hint="From applied AI recommendations"
            tone="naira"
          />
          <KpiTile
            label="Payment method"
            value="Visa · 4271"
            icon={<CreditCard size={14} aria-hidden />}
            hint="Auto-renews on next cycle"
            tone="violet"
          />
        </section>

        {/* Current plan */}
        <CurrentPlanCard
          plan={currentPlan}
          interval="monthly"
          renewalDate={stats.payDate}
          daysUntilRenewal={stats.daysUntilRenewal}
        />

        {/* Usage meters */}
        <section
          aria-label="Plan usage"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {usageMetrics.map((m, i) => (
            <div
              key={m.id}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <UsageMeter metric={m} />
            </div>
          ))}
        </section>

        {/* Plan matrix */}
        <section
          aria-label="Plan catalog"
          className="space-y-3"
        >
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mist-50">
                Compare plans
              </h2>
              <p className="text-sm text-mist-400">
                Annual billing saves ~17%. Switch tiers any time — no
                commitment.
              </p>
            </div>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
                <PlanMatrixCard
                  plan={p}
                  highlighted={p.id === currentPlan.id}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Invoices */}
        <InvoicesList invoices={invoices} />

        <footer className="text-[11px] text-mist-400 flex flex-wrap gap-3 items-center justify-between rounded-lg hairline px-4 py-3">
          <span>
            Payments secured by{" "}
            <code className="text-[10px] bg-mist-50/[0.05] rounded px-1.5 py-0.5">
              Paystack
            </code>
            . Receipts auto-emailed within 60s.
          </span>
          <span className="text-mist-500">
            Currency: NGN · billed monthly
          </span>
        </footer>
      </main>
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon,
  hint,
  tone
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
  tone: "violet" | "naira";
}) {
  return (
    <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-up relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-3xl"
        style={{
          background:
            tone === "naira"
              ? "rgba(16,185,129,0.16)"
              : "rgba(167,139,250,0.16)"
        }}
      />
      <div className="relative flex items-center justify-between mb-3">
        <span
          className={
            "inline-flex h-8 w-8 items-center justify-center rounded-lg hairline " +
            (tone === "naira"
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-violet-500/15 text-violet-300")
          }
        >
          {icon}
        </span>
      </div>
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-mist-500">
          {label}
        </div>
        <div className="mt-1 text-xl font-semibold text-mist-50 tabular-nums animate-count-up">
          {value}
        </div>
        <div className="mt-0.5 text-[11px] text-mist-400">{hint}</div>
      </div>
    </div>
  );
}

function KpiPill({
  label,
  value,
  highlight
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-mist-50/[0.04] hairline px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-mist-500">
        {label}
      </div>
      <div
        className={
          "text-sm font-semibold tabular-nums " +
          (highlight ? "text-emerald-300" : "text-mist-50")
        }
      >
        {value}
      </div>
    </div>
  );
}

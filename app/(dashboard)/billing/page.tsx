import {
  CalendarDays,
  CreditCard,
  Sparkles,
  Users,
  Wallet
} from "lucide-react";

import { Topbar } from "@/components/dashboard/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
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
import { UsageMeter } from "@/components/billing/usage-meter";
import { InvoicesList } from "@/components/billing/invoice-list";

export default async function BillingPage() {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);
  const stats = billingStats();

  const fullName = user?.profile?.full_name ?? "User";
  const profile = {
    avatar:
      user?.profile?.avatar ||
      fullName
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "?",
    fullName,
    businessName: orgName
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />

      <main className="flex-1 space-y-4 px-4 py-6 md:px-6 lg:px-8">
        <PageHeader
          eyebrow="Billing center"
          title="Plan and usage"
          description={
            <>
              {orgName} is on the{" "}
              <span className="font-medium text-brand-300">
                {currentPlan.name}
              </span>{" "}
              plan at {formatNaira(currentPlan.priceMonthly)}/month, with{" "}
              {formatNaira(stats.savedYtd)} saved through applied
              recommendations this year.
            </>
          }
          actions={
            <>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 text-[11.5px] font-medium text-mist-300 transition-colors hover:bg-white/[0.04] hover:text-mist-50"
              >
                <CreditCard size={12} aria-hidden />
                Manage payment
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-brand-500"
              >
                <Sparkles size={12} aria-hidden />
                Upgrade plan
              </button>
            </>
          }
        />

        <section
          aria-label="Billing KPIs"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <KpiTile
            icon="calendar"
            tone="#34D399"
            label="Next renewal"
            value={`${stats.daysUntilRenewal} days`}
            hint={`${formatNaira(currentPlan.priceMonthly)} · Pro`}
          />
          <KpiTile
            icon="users"
            tone="#60A5FA"
            label="Seats included"
            value={String(currentPlan.limits.seatsIncluded)}
            hint="You plus four collaborators"
          />
          <KpiTile
            icon="wallet"
            tone="#A78BFA"
            label="Saved year to date"
            value={formatNaira(stats.savedYtd)}
            hint="From applied recommendations"
          />
          <KpiTile
            icon="card"
            tone="#FBBF24"
            label="Payment method"
            value="Visa · 4271"
            hint="Auto-renews on the next cycle"
          />
        </section>

        <CurrentPlanCard
          plan={currentPlan}
          interval="monthly"
          renewalDate={stats.payDate}
          daysUntilRenewal={stats.daysUntilRenewal}
        />

        <section aria-label="Plan usage" className="grid gap-3 md:grid-cols-2">
          {usageMetrics.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 80}ms` }}>
              <UsageMeter metric={m} />
            </div>
          ))}
        </section>

        <section aria-label="Plan catalog" className="space-y-3">
          <div>
            <h2 className="text-[13px] font-semibold text-mist-50">
              Compare plans
            </h2>
            <p className="text-[11.5px] text-mist-500">
              Annual billing saves about 17%. Switch tiers any time.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <InvoicesList invoices={invoices} />

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-4 py-3 text-[11px] text-mist-500">
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={11} aria-hidden />
            Payments secured by{" "}
            <code className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] text-mist-300">
              Paystack
            </code>
            . Receipts are auto-emailed within 60 seconds.
          </span>
          <span>NGN · billed monthly</span>
        </footer>
      </main>
    </div>
  );
}

const KPI_ICONS = {
  calendar: CalendarDays,
  users: Users,
  wallet: Wallet,
  card: CreditCard
} as const;

function KpiTile({
  icon,
  tone,
  label,
  value,
  hint
}: {
  icon: keyof typeof KPI_ICONS;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  const Icon = KPI_ICONS[icon];
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="stat-label min-w-0">{label}</div>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${tone}1f`, color: tone }}
          aria-hidden
        >
          <Icon size={12} strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-1.5 truncate text-[17px] font-semibold tracking-tight text-mist-50 tabular-nums">
        {value}
      </div>
      <div className="mt-1 truncate text-[11px] text-mist-500">{hint}</div>
    </Panel>
  );
}

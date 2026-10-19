import { LinkButton } from "@/components/ui/button";

/**
 * Rate card.
 *
 * Was three floating cards with a gradient rule, a crown icon and a lift on
 * hover — the default SaaS pricing block. This is a printed rate card: column
 * headings, ruled rows, right-aligned figures, and one inverted ink band for
 * the plan most people take. No card floats anywhere.
 */

type Tier = {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Basic",
    price: "₦25,000",
    blurb: "For solo founders spending ₦50k–₦200k/mo on ads.",
    features: [
      "1 connected platform",
      "Daily AI recommendations",
      "Weekly PDF reports",
      "WhatsApp support"
    ],
    cta: "Start with Basic"
  },
  {
    name: "Pro",
    price: "₦50,000",
    blurb: "For scaling SMEs running campaigns across platforms.",
    features: [
      "Up to 3 connected platforms",
      "Priority AI insights (4×/day)",
      "Smart automations (5 rules)",
      "Custom report builder",
      "Monthly strategy call",
      "Influencer marketplace access"
    ],
    cta: "Start with Pro",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "₦150,000",
    blurb: "For agencies and ₦1M+/mo teams.",
    features: [
      "Unlimited platforms",
      "Unlimited automations",
      "Dedicated account manager",
      "Custom dashboards and API",
      "White-label client reports",
      "SLA + onboarding training"
    ],
    cta: "Talk to sales"
  }
];

const COLUMNS = "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)_auto_auto]";

function TierRow({ tier }: { tier: Tier }) {
  const inv = tier.highlight;

  return (
    <div
      className={
        "grid gap-5 px-5 py-6 sm:px-6 lg:items-start lg:gap-8 " +
        COLUMNS +
        (inv
          ? " bg-ink-950 text-paper-50 dark:bg-paper-50 dark:text-ink-950"
          : "")
      }
    >
      {/* Plan */}
      <div className="order-1 lg:order-none">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={
              "display text-xl " +
              // `.display` forces paper-50 in dark mode; the inverted row is
              // paper-on-ink there, so its title has to win that rule outright.
              (inv ? "text-paper-50 dark:!text-ink-950" : "")
            }
          >
            {tier.name}
          </h3>
          {inv && (
            <span
              className="
                inline-flex border px-1.5 py-0.5 font-mono text-xs font-medium uppercase tracking-[0.14em]
                border-paper-100/45 text-paper-100
                dark:border-ink-950/45 dark:text-ink-950
              "
            >
              Most chosen
            </span>
          )}
        </div>
        <p
          className={
            "mt-2 max-w-xs text-sm leading-relaxed " +
            (inv
              ? "text-paper-200 dark:text-ink-600"
              : "text-mist-600 dark:text-mist-300")
          }
        >
          {tier.blurb}
        </p>
      </div>

      {/* Included */}
      <ul className="order-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:order-none lg:grid-cols-1 xl:grid-cols-2">
        {tier.features.map((f) => (
          <li
            key={f}
            className={
              "flex items-baseline gap-2 font-mono text-xs leading-relaxed " +
              (inv
                ? "text-paper-200 dark:text-ink-600"
                : "text-mist-600 dark:text-mist-300")
            }
          >
            <span
              aria-hidden
              className={
                inv
                  ? "text-brand-300 dark:text-brand-700"
                  : "text-brand-700 dark:text-brand-300"
              }
            >
              +
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="order-2 lg:order-none lg:text-right">
        <span
          className={
            "num text-3xl font-medium " +
            (inv ? "text-paper-50 dark:text-ink-950" : "text-ink-950 dark:text-paper-50")
          }
        >
          {tier.price}
        </span>
        <span
          className={
            "ml-1 font-mono text-xs " +
            (inv ? "text-paper-200 dark:text-ink-600" : "text-mist-500")
          }
        >
          /month
        </span>
      </div>

      {/* Action */}
      <div className="order-4 lg:order-none">
        <LinkButton
          href="/dashboard"
          variant={inv ? "primary" : "secondary"}
          size="sm"
          className={
            inv
              ? "!border-paper-50 !bg-paper-50 !text-ink-950 hover:!bg-brand-200 hover:!border-brand-200 dark:!border-ink-950 dark:!bg-ink-950 dark:!text-paper-50 dark:hover:!bg-brand-800 dark:hover:!border-brand-800"
              : ""
          }
        >
          {tier.cta}
        </LinkButton>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-section md:py-section-lg bg-surface-100 dark:bg-ink-900"
    >
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="flex items-center gap-4">
          <span className="kicker text-brand-700 dark:text-brand-300">04 — Rate card</span>
          <span className="h-px flex-1 bg-ink-950/20 dark:bg-paper-100/20" />
          <span className="kicker">NGN · monthly</span>
        </div>

        <div className="mt-6 max-w-2xl">
          <h2 className="display text-3xl leading-tight sm:text-5xl">
            One price list.
            <br />
            No setup fee, no dollar conversion.
          </h2>
          <p className="mt-4 text-base text-mist-600 dark:text-mist-300">
            Every plan includes the 14-day trial. Cancel whenever — the card is
            billed in Naira through Paystack, the way you already pay.
          </p>
        </div>

        {/* The rate card */}
        <div className="mt-10 border border-ink-950/20 dark:border-paper-100/20">
          {/* Column headings (desktop only) */}
          <div
            className={
              "hidden border-b border-ink-950/20 px-6 py-2.5 lg:grid lg:gap-8 dark:border-paper-100/20 " +
              COLUMNS
            }
          >
            <span className="kicker">Plan</span>
            <span className="kicker">Included</span>
            <span className="kicker justify-end">Per month</span>
            <span className="sr-only">Action</span>
          </div>

          {TIERS.map((t) => (
            <div
              key={t.name}
              className="border-b border-ink-950/15 last:border-b-0 dark:border-paper-100/15"
            >
              <TierRow tier={t} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-xs text-mist-500 dark:text-mist-400">
          <span>14-day free trial on every plan · Cancel anytime · No setup fees</span>
          <span>Billed in ₦ via Paystack · Prices exclude VAT</span>
        </div>
      </div>
    </section>
  );
}

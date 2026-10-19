import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PatternField, SignalRings } from "@/components/landing/pattern-field";

/**
 * Pricing.
 *
 * Three glass cards on the dark shell, with the middle plan lifted by an
 * emerald-tinted border and a ring instead of a second background colour.
 * Prices and inclusions are unchanged from the product's rate card.
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

export function Pricing() {
  return (
    <section id="pricing" className="relative isolate py-section md:py-section-lg">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 glow-bed opacity-60" />

      <PatternField motif="dots" mask="corner-bl" className="bottom-0 left-0 h-80 w-1/3" opacity={70} />
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Pricing
          </span>
          <h2 className="headline-fade mt-5 text-5xl font-medium">
            Simple plans, billed in naira.
          </h2>
          <p className="mt-4 text-base text-shell/55">
            Every plan starts with a 14-day trial. Cancel anytime — no setup
            fee, no dollar conversion, no surprises.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TIERS.map((t) => {
            const hl = t.highlight;
            return (
              <div
                key={t.name}
                className={
                  "relative flex flex-col rounded-2xl border p-6 sm:p-7 " +
                  (hl
                    ? "border-accent/40 bg-brand-500/[0.06] ring-1 ring-brand-400/20"
                    : "border-shell/10 bg-shell/[0.025]")
                }
                style={
                  hl
                    ? { backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 55%)" }
                    : undefined
                }
              >
                {hl && (
                  <span className="absolute -top-3 left-6 rounded-full border border-accent/40 bg-shellbg px-3 py-1 text-xs font-medium text-accent">
                    Most popular
                  </span>
                )}

                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-medium text-shell">{t.name}</h3>
                  {hl && <span className="text-xs text-accent">Best value</span>}
                </div>

                <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-shell/55">
                  {t.blurb}
                </p>

                <div className="mt-6 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                  {/* 3xl on phones: a 48px naira price plus "/month" was the
                      card's min-content and pushed the grid 36px past a 320px
                      viewport. */}
                  <span className="text-3xl font-medium tracking-tight text-shell sm:text-5xl">
                    {t.price}
                  </span>
                  <span className="text-sm text-shell/55">/month</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3 border-t border-shell/10 pt-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-shell/70">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/15">
                        <Check size={10} strokeWidth={3} className="text-accent" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <LinkButton
                    href="/signup"
                    variant={hl ? "white" : "glass"}
                    size="md"
                    className="w-full"
                  >
                    {t.cta}
                  </LinkButton>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-shell/55">
          14-day free trial on every plan · Cancel anytime · Prices exclude VAT ·
          Billed in ₦ via Paystack
        </p>
      </div>
    </section>
  );
}

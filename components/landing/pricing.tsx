import { LinkButton } from "@/components/ui/button";
import { Check, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <section
      id="pricing"
      className="
        relative py-section md:py-section-lg
        bg-surface-100 dark:bg-ink-900
      "
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span
            className="chip chip-brand"
          >
            Pricing
          </span>
          <h2
            className="
              mt-5 text-3xl font-bold tracking-tight
              text-mist-600 dark:text-mist-50
            "
          >
            Simple monthly plans.{" "}
            <span className="gradient-text">Paystack-billed.</span>
          </h2>
          <p
            className="
              mt-4 leading-relaxed text-mist-600 dark:text-mist-300
            "
          >
            14-day free trial on every plan. Cancel anytime. No setup fees —
            billed in Naira the way you already pay.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative rounded-2xl overflow-hidden p-6 md:p-7 transition-all duration-300 hover-lift group",
                t.highlight
                  ? "bg-white border-2 border-brand-700/60 shadow-card dark:border-brand-500/60 dark:shadow-card dark:bg-ink-900"
                  : "bg-white border border-mist-200 shadow-card dark:bg-ink-900 dark:border-ink-700 dark:shadow-card hover:border-brand-300/60"
              )}
            >
              {t.highlight && (
                <div
                  className="absolute inset-x-0 -top-px h-[3px] rounded-t-2xl-2xl "
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #14532D 0%, #15803D 20%, #16A34A 40%, #22C55E 60%, #16A34A 80%, #15803D 100%)",
                    backgroundSize: "200% 100%"
                  }}
                />
              )}
              {t.highlight && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 dark:opacity-70 "
                  style={{
                    background:
                      "radial-gradient(80% 60% at 50% 0%, rgba(16,185,129,0.18), transparent 70%)"
                  }}
                />
              )}
              {t.highlight && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-6 right-6"
                >
                  <Crown
                    size={20}
                    strokeWidth={2.2}
                    className="text-brand-500 "
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3
                  className="
                    text-base font-semibold tracking-tight
                    text-mist-600 dark:text-mist-50
                  "
                >
                  {t.name}
                </h3>
                {t.highlight && (
                  <span
                    className="chip chip-brand font-semibold"
                  >
                    <Sparkles size={11} />
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span
                  className="
                    text-3xl font-bold tracking-tight
                    text-mist-600 dark:text-mist-50
                  "
                >
                  {t.price}
                </span>
                <span className="text-mist-500 dark:text-mist-400 ml-1">/ month</span>
              </div>
              <p className="mt-3 text-sm text-mist-600 dark:text-mist-300">
                {t.blurb}
              </p>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="
                      flex items-start gap-2.5 text-sm
                      text-mist-700 dark:text-mist-200
                    "
                  >
                    <span
                      className="
                        mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full
                        bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300
                        dark:bg-brand-500/20 dark:text-brand-300
                      "
                    >
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <LinkButton
                  href="/dashboard"
                  variant={t.highlight ? "primary" : "secondary"}
                  size="md"
                  className={cn("w-full touch-target group/cta", t.highlight && "shadow-card hover:shadow-glow")}
                >
                  {t.cta}
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

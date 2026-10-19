import {
  BarChart3,
  Bot,
  Check,
  Mail,
  Rocket,
  Sparkles,
  Users,
  type LucideIcon
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PatternField, SignalRings } from "@/components/landing/pattern-field";

/**
 * Features — six glass cards on the dark shell.
 *
 * The section is the product's capability list, so the cards stay quiet:
 * icon tile, name, one paragraph, three facts. Depth comes from a 1px white
 * border and a top-light sheen, not from shadows or illustration.
 */

type Feature = {
  icon: LucideIcon;
  title: string;
  blurb: string;
  points: string[];
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Smart automations",
    blurb:
      "Set the rules once. Pause bad ads, rotate creatives, and rebalance budget across platforms the moment conditions change.",
    points: [
      "Trigger-based rules — no code, no engineer",
      "Reinvest paused spend automatically into winners",
      "Full audit log of every action taken"
    ]
  },
  {
    icon: BarChart3,
    title: "Multi-platform analytics",
    blurb:
      "Every naira, click, and conversion from Meta, Google, and TikTok in one view — sliced by platform, campaign, or audience.",
    points: ["Live sync, no CSV imports", "Cohort + funnel breakdowns", "Export to PDF or CSV in two clicks"]
  },
  {
    icon: Rocket,
    title: "One-click deployment",
    blurb:
      "Push campaigns live to Meta, Google, and TikTok from one editor — using each platform's own API, with budgets and creatives synced.",
    points: ["Native integrations, OAuth-secured", "Same campaign, every channel"]
  },
  {
    icon: Bot,
    title: "AI recommendations",
    blurb:
      "Yesterday's spend, today's three highest-ROI changes — straight to your inbox, ranked by expected return.",
    points: ["Specific reallocations, not vague tips", "Links straight into Ads Manager"]
  },
  {
    icon: Mail,
    title: "Monday-ready reports",
    blurb:
      "A branded PDF lands every Monday with the numbers, the wins, and your next three moves. Forward it and look on top of everything.",
    points: ["Top 3 actions auto-included", "Share via email or WhatsApp"]
  },
  {
    icon: Users,
    title: "Influencer marketplace",
    blurb:
      "Find vetted micro-influencers, manage briefs, pay through Paystack escrow — all from one inbox.",
    points: ["Fake-follower verified creators", "Escrow payments · 15% fee"]
  }
];

export function Features() {
  return (
    <section id="features" className="relative isolate py-section md:py-section-lg">
      <PatternField motif="dots" mask="corner-tr" className="right-0 top-0 h-80 w-2/5" opacity={80} />
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <Sparkles size={12} className="text-accent" />
            Everything in one place
          </span>
          <h2 className="headline-fade mt-5 text-3xl font-medium sm:text-5xl">
            One dashboard that reads your whole campaign.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-shell/55">
            Built for Nigerian SMEs spending ₦100k–₦500k a month across
            platforms — tired of opening five tabs just to know what&apos;s working.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="
                  group rounded-2xl border border-shell/10 bg-gradient-to-b from-shell/[0.05] to-transparent
                  p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-shell/20
                "
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-accent ring-1 ring-inset ring-accent/20">
                  <Icon size={18} strokeWidth={1.75} />
                </span>

                <h3 className="mt-5 text-xl font-medium text-shell">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-shell/55">{f.blurb}</p>

                <ul className="mt-4 space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-relaxed text-shell/65">
                      <Check size={14} className="mt-1 shrink-0 text-accent" strokeWidth={2.5} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" variant="white" size="md">
            Start free
          </LinkButton>
          <LinkButton href="#pricing" variant="glass" size="md">
            See pricing
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

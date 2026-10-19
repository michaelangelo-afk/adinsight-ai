import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

/**
 * Feature index.
 *
 * Six instruments, set as a ruled index rather than a bento of cards: number,
 * name, what it does, and the three facts that matter. The list is the section —
 * no icon halos, no gradient washes, no hover lift.
 */

type Feature = {
  title: string;
  blurb: string;
  points: string[];
};

const FEATURES: Feature[] = [
  {
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
    title: "Multi-platform analytics",
    blurb:
      "Every naira, click, and conversion from Meta, Google, and TikTok in one view — sliced by platform, campaign, or audience.",
    points: [
      "Live sync, no CSV imports",
      "Cohort + funnel breakdowns",
      "Export to PDF or CSV in two clicks"
    ]
  },
  {
    title: "One-click deployment",
    blurb:
      "Push campaigns live to Meta, Google, and TikTok from one editor — using each platform's own API, with budgets and creatives synced.",
    points: ["Native integrations, OAuth-secured", "Same campaign, every channel"]
  },
  {
    title: "AI recommendations",
    blurb:
      "Yesterday’s spend, today’s three highest-ROI changes — straight to your inbox.",
    points: [
      "Specific reallocations, not vague tips",
      "Links straight into Ads Manager"
    ]
  },
  {
    title: "Monday-ready reports",
    blurb:
      "Branded PDF every Monday. Forward to investors and look like you’re on top of everything.",
    points: ["Top 3 actions auto-included", "Share via email or WhatsApp"]
  },
  {
    title: "Influencer marketplace",
    blurb:
      "Find vetted micro-influencers, manage briefs, pay through Paystack escrow — all from one inbox.",
    points: ["Fake-follower verified creators", "Escrow payments · 15% fee"]
  }
];

export function Features() {
  return (
    <section id="features" className="relative py-section md:py-section-lg">
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        {/* Section head — the same edition rail as the front page. */}
        <div className="flex items-center gap-4">
          <span className="kicker text-brand-700 dark:text-brand-300">
            02 — What&apos;s inside
          </span>
          <span className="h-px flex-1 bg-ink-950/20 dark:bg-paper-100/20" />
          <span className="kicker">Six instruments</span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 className="display text-3xl sm:text-5xl lg:col-span-7">
            One page that reads your whole campaign.
          </h2>
          <p className="text-base leading-relaxed text-mist-600 dark:text-mist-300 lg:col-span-5 lg:pt-2">
            Built for Nigerian SMEs spending ₦100k–₦500k a month across
            platforms — tired of opening five tabs just to know what’s working.
          </p>
        </div>

        {/* The index itself. */}
        <ol className="mt-12 border-b border-ink-950/15 dark:border-paper-100/15">
          {FEATURES.map((f, i) => (
            <li
              key={f.title}
              className="border-t border-ink-950/15 dark:border-paper-100/15"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 py-6 md:grid-cols-12 md:items-start md:py-7">
                <span className="num text-xs text-mist-500 dark:text-mist-400 md:col-span-1 md:pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="md:col-span-5">
                  <h3 className="display text-xl md:text-3xl">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-600 dark:text-mist-300">
                    {f.blurb}
                  </p>
                </div>

                <ul className="space-y-1.5 md:col-span-5 md:pt-1">
                  {f.points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2 font-mono text-xs leading-relaxed text-mist-600 dark:text-mist-300"
                    >
                      <span aria-hidden className="text-brand-700 dark:text-brand-300">
                        —
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div aria-hidden className="hidden md:col-span-1 md:flex md:justify-end md:pt-1">
                  <ArrowRight
                    aria-hidden
                    size={16}
                    strokeWidth={1.5}
                    className="text-mist-400 dark:text-mist-500"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Closing rule of the section. */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.08em] text-mist-500">
            Every action is logged. Every naira is attributable.
          </p>
          <LinkButton href="/signup" variant="secondary" size="md" className="group">
            Open your first statement
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

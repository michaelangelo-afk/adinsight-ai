import {
  BarChart3,
  Sparkles,
  Rocket,
  Mail,
  Users,
  type LucideIcon
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  blurb: string;
  points: string[];
  /** Tailwind classes applied to the outer wrapper for bento sizing */
  span: string;
  /** Tailwind classes for the icon halo */
  iconHalo: string;
  /** Stagger delay for entry animation (ms) */
  delay: number;
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
    ],
    span: "md:col-span-2 md:row-span-2",
    iconHalo:
      "bg-violet-700/15 border-violet-700/30 dark:bg-violet-700/15 dark:border-violet-700/30",
    delay: 0
  },
  {
    icon: BarChart3,
    title: "Multi-platform analytics",
    blurb:
      "Every naira, click, and conversion from Meta, Google, and TikTok in one view — sliced by platform, campaign, or audience.",
    points: [
      "Live sync, no CSV imports",
      "Cohort + funnel breakdowns",
      "Export to PDF or CSV in two clicks"
    ],
    span: "md:col-span-2",
    iconHalo:
      "bg-naira-600/15 border-naira-600/30 dark:bg-emerald-500/15 dark:border-emerald-500/30",
    delay: 80
  },
  {
    icon: Rocket,
    title: "One-click deployment",
    blurb:
      "Push campaigns live to Meta, Google, and TikTok from one editor — using each platform's own API, with budgets and creatives synced.",
    points: [
      "Native integrations, OAuth-secured",
      "Same campaign, every channel"
    ],
    span: "md:col-span-1",
    iconHalo:
      "bg-violet-700/15 border-violet-700/30 dark:bg-violet-700/15 dark:border-violet-700/30",
    delay: 140
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    blurb:
      "Yesterday’s spend, today’s three highest-ROI changes — straight to your inbox.",
    points: [
      "Specific reallocations, not vague tips",
      "Links straight into Ads Manager"
    ],
    span: "md:col-span-1",
    iconHalo:
      "bg-naira-600/15 border-naira-600/30 dark:bg-emerald-500/15 dark:border-emerald-500/30",
    delay: 200
  },
  {
    icon: Mail,
    title: "Monday-ready reports",
    blurb:
      "Branded PDF every Monday. Forward to investors and look like you’re on top of everything.",
    points: [
      "Top 3 actions auto-included",
      "Share via email or WhatsApp"
    ],
    span: "md:col-span-1",
    iconHalo:
      "bg-violet-700/15 border-violet-700/30 dark:bg-violet-700/15 dark:border-violet-700/30",
    delay: 260
  },
  {
    icon: Users,
    title: "Influencer marketplace",
    blurb:
      "Find vetted micro-influencers, manage briefs, pay through Paystack escrow — all from one inbox.",
    points: [
      "Fake-follower verified creators",
      "Escrow payments · 15% fee"
    ],
    span: "md:col-span-2",
    iconHalo:
      "bg-naira-600/15 border-naira-600/30 dark:bg-emerald-500/15 dark:border-emerald-500/30",
    delay: 320
  }
];

interface FeatureCardProps {
  feature: Feature;
  size?: "lg" | "md" | "sm";
}

function FeatureCard({ feature, size = "md" }: FeatureCardProps) {
  const Icon = feature.icon;
  const isHero = size === "lg";

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden
        bg-white border border-mist-200
        hover:border-violet-700/50
        hover:-translate-y-1 hover:scale-[1.01]
        hover:shadow-glow-forest dark:hover:shadow-glow-emerald-dark
        transition-all duration-300 ease-out
        dark:bg-ink-900 dark:border-ink-700
        ${feature.span}
      `}
      style={{ animationDelay: `${feature.delay}ms` }}
    >
      {/* soft emerald wash on hover */}
      <div
        className="
          pointer-events-none absolute -top-24 -right-24 h-56 w-56
          rounded-full bg-brand-gradient-soft blur-3xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        "
      />
      {/* top accent line */}
      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r from-transparent via-violet-700/40 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          dark:via-violet-400/40
        "
      />

      <div
        className={"relative z-10 " + (isHero ? "p-7 md:p-8" : "p-6")}
      >
        <div
          className={
            "inline-flex items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.4)] " +
            feature.iconHalo +
            " " +
            (isHero ? "h-12 w-12" : "h-11 w-11")
          }
        >
          <Icon
            size={isHero ? 22 : 20}
            className="text-violet-700 dark:text-violet-300 transition-transform duration-300"
            strokeWidth={2}
          />
        </div>
        <h3
          className={
            "mt-5 font-bold tracking-tight text-mist-600 dark:text-mist-50 " +
            (isHero ? "text-2xl" : "text-lg")
          }
        >
          {feature.title}
        </h3>
        <p
          className={
            "mt-2 leading-relaxed text-mist-600 dark:text-mist-300 " +
            (isHero ? "text-base" : "text-sm")
          }
        >
          {feature.blurb}
        </p>
        <ul className={"mt-5 space-y-2 " + (isHero ? "mt-6" : "")}>
          {feature.points.map((p) => (
            <li
              key={p}
              className={
                "flex items-start gap-2.5 text-mist-700 dark:text-mist-200 " +
                (isHero ? "text-sm" : "text-[13px]")
              }
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="
        relative py-24 md:py-32
        bg-surface-100 dark:bg-ink-900
      "
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span
            className="
              chip
              bg-violet-700/10 border border-violet-700/30 text-violet-700 dark:text-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10
              dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
            "
          >
            The four pillars · now with automations
          </span>
          <h2
            className="
              mt-5 text-3xl md:text-4xl font-bold tracking-tight
              text-mist-600 dark:text-mist-50
            "
          >
            One dashboard to <span className="gradient-text">grow</span>{" "}
            every naira you spend.
          </h2>
          <p
            className="
              mt-4 text-base md:text-lg leading-relaxed
              text-mist-600 dark:text-mist-300
            "
          >
            Built for Nigerian SMEs spending ₦100k–₦500k a month across
            platforms — tired of opening five tabs just to know what’s working.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-fr">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up"
              style={{
                animationFillMode: "both",
                animationDelay: `${f.delay}ms`
              }}
            >
              <FeatureCard
                feature={f}
                size={i === 0 ? "lg" : i === 1 || i === 5 ? "md" : "sm"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

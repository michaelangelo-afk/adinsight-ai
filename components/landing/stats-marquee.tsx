import {
  Zap,
  Sparkles,
  TrendingDown,
  Rocket,
  ShieldCheck
} from "lucide-react";

type Stat = {
  icon: typeof Zap;
  text: string;
};

const STATS: Stat[] = [
  { icon: Zap, text: "₦12M+ ad spend optimised this week" },
  { icon: Sparkles, text: "142 automation rules fired in the last hour" },
  { icon: TrendingDown, text: "Avg CPC cut by 18% across Meta + Google" },
  { icon: Rocket, text: "1,200+ native campaigns deployed this quarter" },
  { icon: ShieldCheck, text: "Paystack-backed · Nigeria-first billing" }
];

export function StatsMarquee() {
  // Render twice for the seamless looping marquee.
  const loop = [...STATS, ...STATS];

  return (
    <section
      aria-label="Live platform stats"
      className="
        relative border-y py-6 overflow-hidden
        border-mist-200 bg-surface-100
        dark:border-ink-700 dark:bg-ink-900
      "
    >
      {/* Soft edge masks so pills fade in/out at boundaries */}
      <div
        className="
          pointer-events-none absolute inset-y-0 left-0 w-24 z-10
          bg-gradient-to-r from-surface-100 to-transparent
          dark:from-ink-900 dark:to-transparent
        "
      />
      <div
        className="
          pointer-events-none absolute inset-y-0 right-0 w-24 z-10
          bg-gradient-to-l from-surface-100 to-transparent
          dark:from-ink-900 dark:to-transparent
        "
      />

      <div
        className="flex w-max gap-3 animate-marquee"
        style={{ willChange: "transform" }}
      >
        {loop.map((s, i) => {
          const Icon = s.icon;
          return (
        <div
          key={i}
          className="
            relative overflow-hidden shimmer-stripe flex items-center gap-2.5 rounded-full px-4 py-2 whitespace-nowrap
            bg-white border border-mist-200 shadow-card-flat
            dark:bg-ink-850 dark:border-ink-700 dark:shadow-card-flat-dark
          "
        >
              <span
                className="
                  inline-flex h-5 w-5 items-center justify-center rounded-md
                  bg-violet-700/10 dark:bg-violet-700/15
                "
              >
                <Icon
                  size={11}
                  strokeWidth={2.4}
                  className="text-violet-700 dark:text-violet-300"
                />
              </span>
              <span className="text-[13px] font-semibold text-mist-600 dark:text-mist-100">
                {s.text}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

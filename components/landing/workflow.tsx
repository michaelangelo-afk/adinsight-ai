import { Plug, Sparkles, LineChart, Check } from "lucide-react";

const STEPS = [
  {
    icon: Plug,
    eyebrow: "Step 1",
    title: "Connect and deploy",
    body:
      "One-click OAuth for Meta, Google, TikTok, X, and LinkedIn. Push new campaigns live to every platform from a single editor — using each platform’s own API. No spreadsheets, no tabs.",
    bullets: ["OAuth-secured", "Native platform APIs", "Daily auto-sync"]
  },
  {
    icon: Sparkles,
    eyebrow: "Step 2",
    title: "Build automations",
    body:
      "Set the rules once: pause any Instagram Story ad when CPC passes ₦400, rotate creative every Tuesday, or rebalance 10% of any under-performing budget into your top Lagos campaign. The engine does the rest.",
    bullets: ["Visual rule editor", "Trigger + condition + action", "Full audit log"]
  },
  {
    icon: LineChart,
    eyebrow: "Step 3",
    title: "Analyze and scale",
    body:
      "One dashboard tells you which naira is growing and which is going to waste. A polished Monday-ready PDF lands in your inbox with the numbers, the wins, and your next three moves.",
    bullets: ["Multi-platform ROI view", "AI-prioritised actions", "Branded weekly report"]
  }
];

export function Workflow() {
  return (
    <section id="workflow" className="relative py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-glow-emerald blur-3xl opacity-50 dark:opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span
            className="
              chip
              bg-naira-600/15 border border-naira-600/30 text-naira-700
              dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300
            "
          >
            How it works
          </span>
          <h2
            className="
              mt-5 text-3xl md:text-4xl font-bold tracking-tight
              text-mist-600 dark:text-mist-50
            "
          >
            From signup to your first live automation{" "}
            <span className="gradient-text">in under 10 minutes.</span>
          </h2>
          <p
            className="
              mt-4 text-base md:text-lg leading-relaxed
              text-mist-600 dark:text-mist-300
            "
          >
            No agency. No developer. No waiting on anyone’s report.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5 relative">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="
                  group relative rounded-2xl p-7 transition-all duration-300 hover-lift
                  bg-white border border-mist-200 shadow-card-flat
                  hover:border-violet-700/40 hover:shadow-glow-forest
                  dark:bg-ink-900 dark:border-ink-700 dark:shadow-card-flat-dark
                  dark:hover:border-violet-700/40 dark:hover:shadow-glow-emerald-dark
                "
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-emerald transition-all duration-300 group-hover:scale-110 group-hover:rotate-[6deg] group-hover:shadow-[0_0_30px_-4px_rgba(16,185,129,0.6)]">
                    <Icon size={20} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span
                    className="
                      text-[10px] font-semibold uppercase tracking-[0.18em]
                      text-mist-500 dark:text-mist-400
                    "
                  >
                    {s.eyebrow}
                  </span>
                </div>
                <h3
                  className="
                    mt-6 text-xl font-bold tracking-tight
                    text-mist-600 dark:text-mist-50
                  "
                >
                  {s.title}
                </h3>
                <p
                  className="
                    mt-3 text-sm leading-relaxed
                    text-mist-600 dark:text-mist-300
                  "
                >
                  {s.body}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="
                        flex items-center gap-2.5 text-[13px]
                        text-mist-700 dark:text-mist-200
                      "
                    >
                      <span
                        className="
                          inline-flex h-4 w-4 items-center justify-center rounded-full
                          bg-violet-700/15 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300
                          dark:bg-emerald-500/20 dark:text-emerald-300
                        "
                      >
                        <Check size={10} strokeWidth={3.5} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                {i < STEPS.length - 1 && (
                  <svg
                    aria-hidden
                    className="hidden md:block absolute -right-7 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="56"
                    height="24"
                    viewBox="0 0 56 24"
                    fill="none"
                  >
                    <path
                      d="M 0 12 Q 28 -2, 56 12"
                      stroke="rgb(21 128 61 / 0.45)"
                      className="dark:stroke-[rgb(16,185,129,0.5)]"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 46 4 L 54 12 L 46 20"
                      stroke="rgb(21 128 61 / 0.8)"
                      className="dark:stroke-[rgb(16,185,129,0.85)]"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="56" cy="12" r="2" fill="rgb(22 163 74)" className="dark:fill-[rgb(16,185,129)]" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtle dotted background pattern to reinforce the pipeline metaphor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #15803D 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>
    </section>
  );
}

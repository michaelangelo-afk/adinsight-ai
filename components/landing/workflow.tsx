import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

/**
 * Three acts.
 *
 * No cards, no connector arrows, no icon tiles. Each act is a column of a
 * printed page: an oversized numeral, a rule, the title, the argument, and the
 * facts in mono. The vertical rules do the work that the old arrows pretended
 * to do.
 */

const STEPS = [
  {
    title: "Connect and deploy",
    body: "One-click OAuth for Meta, Google, TikTok, X, and LinkedIn. Push new campaigns live to every platform from a single editor — using each platform’s own API. No spreadsheets, no tabs.",
    bullets: ["OAuth-secured", "Native platform APIs", "Daily auto-sync"]
  },
  {
    title: "Build automations",
    body: "Set the rules once: pause any Instagram Story ad when CPC passes ₦400, rotate creative every Tuesday, or rebalance 10% of any under-performing budget into your top Lagos campaign. The engine does the rest.",
    bullets: ["Visual rule editor", "Trigger + condition + action", "Full audit log"]
  },
  {
    title: "Analyze and scale",
    body: "One dashboard tells you which naira is growing and which is going to waste. A polished Monday-ready PDF lands in your inbox with the numbers, the wins, and your next three moves.",
    bullets: ["Multi-platform ROI view", "AI-prioritised actions", "Branded weekly report"]
  }
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative py-section md:py-section-lg bg-surface-100 dark:bg-ink-900"
    >
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="flex items-center gap-4">
          <span className="kicker text-brand-700 dark:text-brand-300">
            03 — How it works
          </span>
          <span className="h-px flex-1 bg-ink-950/20 dark:bg-paper-100/20" />
          <span className="kicker">Ten minutes</span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 className="display text-3xl sm:text-5xl lg:col-span-8">
            From signup to your first live automation, before lunch.
          </h2>
          <p className="text-base leading-relaxed text-mist-600 dark:text-mist-300 lg:col-span-4 lg:pt-2">
            No agency. No developer. No waiting on anyone’s report.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <article
              key={s.title}
              className={
                "pt-8 " +
                (i === 0
                  ? ""
                  : "border-t border-ink-950/15 dark:border-paper-100/15 lg:border-t-0 lg:border-l lg:pl-8")
              }
            >
              <div className="flex items-baseline justify-between gap-4 border-t border-ink-950/20 pt-4 dark:border-paper-100/20">
                <span
                  aria-hidden
                  className="display text-6xl leading-none text-brand-700/25 dark:text-brand-300/25"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="kicker">Act {i + 1}</span>
              </div>

              <h3 className="display mt-8 text-xl md:text-3xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist-600 dark:text-mist-300">
                {s.body}
              </p>

              <ul className="mt-6 border-t border-ink-950/15 pt-4 dark:border-paper-100/15">
                {s.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-mist-600 dark:text-mist-300"
                  >
                    <span aria-hidden className="text-brand-700 dark:text-brand-300">
                      —
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-950/20 pt-6 dark:border-paper-100/20 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.08em] text-mist-500">
            Connect once. The statement writes itself every Monday.
          </p>
          <LinkButton href="#pricing" variant="secondary" size="md" className="group">
            See the rate card
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

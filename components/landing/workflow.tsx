import { Check, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

/**
 * Workflow — three steps.
 *
 * A horizontal path on desktop (dashed connector behind the cards, numerals
 * as the milestones) and a vertical stack on mobile. Same glass panel recipe
 * as the feature cards so the page reads as one system.
 */

const STEPS = [
  {
    title: "Connect and deploy",
    body:
      "One-click OAuth for Meta, Google, TikTok, X, and LinkedIn. Push new campaigns live to every platform from a single editor — using each platform's own API. No spreadsheets, no tabs.",
    bullets: ["OAuth-secured", "Native platform APIs", "Daily auto-sync"]
  },
  {
    title: "Build automations",
    body:
      "Set the rules once: pause any Instagram Story ad when CPC passes ₦400, rotate creative every Tuesday, or rebalance 10% of any under-performing budget into your top Lagos campaign. The engine does the rest.",
    bullets: ["Visual rule editor", "Trigger + condition + action", "Full audit log"]
  },
  {
    title: "Analyze and scale",
    body:
      "One dashboard tells you which naira is growing and which is going to waste. A polished Monday-ready PDF lands in your inbox with the numbers, the wins, and your next three moves.",
    bullets: ["Multi-platform ROI view", "AI-prioritised actions", "Branded weekly report"]
  }
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative border-y border-white/5 bg-white/[0.015] py-section md:py-section-lg"
    >
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            How it works
          </span>
          <h2 className="headline-fade mt-5 text-3xl font-medium sm:text-5xl">
            From signup to a live automation in ten minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55">
            No agency. No developer. No waiting on anyone&apos;s report.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Path between the milestones. Decorative only. */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[52px] hidden border-t border-dashed border-white/15 lg:block"
          />

          <ol className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="
                  relative rounded-2xl border border-white/10 bg-ink-900/90 p-6
                  transition-colors duration-200 hover:border-white/20
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15 font-mono text-sm font-medium text-brand-200 ring-1 ring-inset ring-brand-300/25">
                    {i + 1}
                  </span>
                  <span className="text-xs text-white/55">Step {i + 1} of 3</span>
                </div>

                <h3 className="mt-5 text-xl font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>

                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-white/65">
                      <Check size={14} className="mt-1 shrink-0 text-brand-300" strokeWidth={2.5} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex justify-center">
          <LinkButton href="#pricing" variant="glass" size="md" className="group">
            See pricing
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

/**
 * Stats band.
 *
 * Replaces the printed ticker with the dark product's trust strip: one hairline
 * band, four numbers, no animation. Values are tabular; labels stay quiet so the
 * numbers carry the row.
 */

import { PatternField, SignalRings } from "@/components/landing/pattern-field";

const STATS = [
  { value: "₦12M+", label: "Ad spend optimised this week" },
  { value: "142", label: "Automations fired this week" },
  { value: "18%", label: "Average CPC cut across Meta + Google" },
  { value: "1,200+", label: "Nigerian teams running on GrowthAds" }
];

export function StatsMarquee() {
  return (
    <section
      aria-label="Live platform stats"
      className="relative isolate overflow-hidden border-y border-shell/10 bg-shellbg"
    >
      <PatternField motif="bars" mask="bottom" className="inset-x-0 bottom-0 h-16" opacity={60} />
      <div className="mx-auto max-w-content px-gutter py-8 lg:px-gutter-lg">
        <p className="text-center text-xs uppercase tracking-[0.16em] text-shell/55">
          Results from the last 30 days
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
          {STATS.map((s, i) => (
            <div
              key={s.value}
              className={
                "px-2 text-center " +
                (i > 0 ? "sm:border-l sm:border-shell/10" : "")
              }
            >
              <dd className="font-mono text-3xl font-medium text-shell">
                {s.value}
              </dd>
              <dt className="mx-auto mt-1.5 max-w-[14rem] text-sm leading-snug text-shell/55">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

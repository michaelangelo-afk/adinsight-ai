/**
 * The ticker.
 *
 * Was five rounded, shadowed pills with glowing icons — the most "template"
 * element on the page. Now it is the subscription strip of a printed paper:
 * one ruled band, mono caps, figures in tabular numerals, hairline separators.
 *
 * The moving track is hidden from assistive tech; the same five items are
 * exposed once, statically, in an `sr-only` list. That keeps the visual loop
 * from being read out twice.
 */
const STATS: { label: string; value: string; note: string }[] = [
  { label: "Spend optimised", value: "₦12M+", note: "this week" },
  { label: "Automation rules fired", value: "142", note: "last hour" },
  { label: "Avg. CPC cut", value: "18%", note: "Meta + Google" },
  { label: "Campaigns deployed", value: "1,200+", note: "this quarter" },
  { label: "Billing", value: "Paystack", note: "NGN · Nigeria-first" }
];

export function StatsMarquee() {
  // Render twice for the seamless looping marquee.
  const loop = [...STATS, ...STATS];

  return (
    <section
      aria-label="Live platform stats"
      className="
        relative overflow-hidden border-y py-3
        border-ink-950/15 bg-surface-50
        dark:border-paper-100/15 dark:bg-ink-950
      "
    >
      {/* Edge fades in the paper stock so items enter and leave the page
          instead of being clipped mid-glyph. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-50 to-transparent dark:from-ink-950"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-50 to-transparent dark:from-ink-950"
      />

      {/* Static, readable copy for screen readers. */}
      <ul className="sr-only">
        {STATS.map((s) => (
          <li key={s.label}>
            {s.label}: {s.value}, {s.note}
          </li>
        ))}
      </ul>

      <div
        aria-hidden
        className="flex w-max animate-marquee items-center"
        style={{ willChange: "transform" }}
      >
        {loop.map((s, i) => (
          <div
            key={i}
            className="flex items-baseline gap-2 whitespace-nowrap px-5 font-mono text-xs uppercase tracking-[0.12em]"
          >
            <span className="text-mist-500 dark:text-mist-400">{s.label}</span>
            <span className="num font-medium text-ink-950 dark:text-paper-50">
              {s.value}
            </span>
            <span className="text-mist-500 dark:text-mist-400">· {s.note}</span>
            <span
              aria-hidden
              className="ml-5 h-3 w-px self-center bg-ink-950/25 dark:bg-paper-100/25"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

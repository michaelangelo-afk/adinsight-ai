import { Logo } from "@/components/brand/logo";

const COLS = [
  {
    title: "Product",
    items: [
      "Dashboard",
      "Automations",
      "Analytics",
      "Deployment",
      "AI recommendations",
      "Influencer marketplace"
    ]
  },
  {
    title: "Company",
    items: ["About", "Pricing", "Careers", "Press"]
  },
  {
    title: "Legal",
    items: ["Privacy", "Terms", "Security", "Data processing"]
  }
];

/**
 * Colophon.
 *
 * The footer is set as the back matter of a newspaper: masthead rule, column
 * headings in mono, link lists as ruled rows rather than floating text, and a
 * fine-print line at the foot. No badges, no chips, no rounded surfaces.
 */
export function Footer() {
  return (
    <footer className="border-t border-ink-950/20 bg-surface-50 dark:border-paper-100/20 dark:bg-ink-950">
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        {/* Masthead line */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-950/15 py-5 dark:border-paper-100/15">
          <Logo />
          <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-mist-500 dark:text-mist-400 sm:block">
            The weekly statement for Nigerian ad spend
          </span>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <p className="max-w-xs text-sm leading-relaxed text-mist-600 dark:text-mist-300">
              GrowthAds turns every naira of paid spend into a line you can
              read: what it bought, what it wasted, and what to do next week.
              Built for Nigerian SMEs running Meta, Google and TikTok.
            </p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-mist-500 dark:text-mist-400">
              Lagos · WAT · NGN
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-3">
              <div className="kicker">{col.title}</div>
              <ul className="mt-3 border-t border-ink-950/15 dark:border-paper-100/15">
                {col.items.map((item) => (
                  <li key={item} className="border-b border-ink-950/10 dark:border-paper-100/10">
                    <a
                      href="#"
                      className="
                        block py-2 text-sm text-mist-600 transition-colors duration-200
                        hover:text-brand-700 dark:text-mist-300 dark:hover:text-brand-300
                      "
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-ink-950/20 py-5 font-mono text-xs uppercase tracking-[0.1em] text-mist-500 dark:border-paper-100/20 dark:text-mist-400 md:flex-row md:items-center md:justify-between">
          <span>© 2026 GrowthAds</span>
          <span>Lagos, Nigeria</span>
          <span>NGN · Paystack</span>
          <span className="text-brand-700 dark:text-brand-300">
            Built for the Monday report.
          </span>
        </div>
      </div>
    </footer>
  );
}

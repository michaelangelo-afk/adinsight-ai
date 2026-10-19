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
 * Footer.
 *
 * Dark, quiet and wide: identity on the left, three link columns on the right,
 * a fine-print bar at the foot. No rules-as-decoration, no stamps — the only
 * lines are the two that separate the page from the colophon and the colophon
 * from the fine print.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <Logo onInk />
          <p className="hidden text-sm text-white/55 sm:block">
            The growth dashboard for Nigerian ad spend.
          </p>
        </div>

        <div className="grid gap-10 border-t border-white/10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              GrowthAds turns every naira of paid spend into a line you can read:
              what it bought, what it wasted, and what to do next week. Built for
              Nigerian SMEs running Meta, Google and TikTok.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/55">
              Lagos · WAT · NGN
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© 2026 GrowthAds</span>
          <span>Lagos, Nigeria</span>
          <span>NGN · Paystack</span>
          <span className="text-white/55">Built for the Monday report.</span>
        </div>
      </div>
    </footer>
  );
}

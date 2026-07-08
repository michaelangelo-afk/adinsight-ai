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

export function Footer() {
  return (
    <footer
      className="
        border-t py-14 mt-10
        border-mist-200 bg-surface-50
        dark:border-ink-700 dark:bg-ink-950
      "
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p
              className="
                mt-4 text-sm max-w-xs leading-relaxed
                text-mist-600 dark:text-mist-300
              "
            >
              The growth platform built for Nigerian SMEs — turning every
              naira of ad spend into measurable, automated growth across
              Meta, Google, and TikTok.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div
                className="
                  text-xs uppercase tracking-wider font-bold
                  text-mist-500 dark:text-mist-300
                "
              >
                {col.title}
              </div>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="
                        relative inline-block text-sm transition-colors duration-200
                        text-mist-600 hover:text-violet-700 dark:text-mist-300 dark:hover:text-violet-300
                        dark:text-mist-300 dark:hover:text-violet-300
                        after:absolute after:left-0 after:right-0 after:-bottom-0.5
                        after:h-px after:origin-left after:scale-x-0
                        after:bg-gradient-to-r after:from-violet-600 after:to-naira-500
                        after:transition-transform after:duration-300 after:ease-out
                        hover:after:scale-x-100
                      "
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="
            mt-10 pt-6 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4
            border-mist-200 dark:border-ink-700
          "
        >
          <div className="text-xs font-medium text-mist-500 dark:text-mist-400">
            © 2026 GrowthAds · Built in Lagos, Nigeria · .ng
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="
                chip font-medium
                bg-violet-700/10 border border-violet-700/30 text-violet-700 dark:text-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10
                dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
              "
            >
              Paystack-secured
            </span>
            <span
              className="
                chip font-medium
                bg-naira-600/15 border border-naira-600/30 text-naira-700
                dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300
              "
            >
              Meta Business Partner
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

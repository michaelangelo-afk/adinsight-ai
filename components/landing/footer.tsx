import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PatternField } from "@/components/landing/pattern-field";
import { ACCOUNT_ITEMS, NAV_ITEMS } from "@/lib/dashboard/nav";

const SECTION_LINKS = [
  { label: "How it works", href: "/#workflow" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" }
];

/**
 * Footer.
 *
 * Dark, quiet and wide: identity on the left, three link columns on the
 * right, a fine-print bar at the foot.
 *
 * The columns are real navigation, not decoration: Product lists every
 * in-app page from `NAV_ITEMS`, Account lists every entry page from
 * `ACCOUNT_ITEMS`, and Company carries the marketing anchors + home.
 * Before this, all twelve footer links were `href="#"` — dead ends that
 * also let the mobile tap-target audit fail (17px tall rows).
 */
export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-shell/10 bg-shellbg">
      <PatternField motif="hatch" mask="top" className="inset-x-0 top-0 h-40" opacity={50} />
      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <Logo />
          <p className="hidden text-sm text-shell/55 sm:block">
            The growth dashboard for Nigerian ad spend.
          </p>
        </div>

        <div className="grid gap-8 border-t border-shell/10 py-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <p className="max-w-xs text-sm leading-relaxed text-shell/55">
              GrowthAds turns every naira of paid spend into a line you can read:
              what it bought, what it wasted, and what to do next week. Built for
              Nigerian SMEs running Meta, Google and TikTok.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-shell/55">
              Lagos · WAT · NGN
            </p>
          </div>

          <nav aria-label="Product">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-shell/55">
              Product
            </h3>
            <ul className="mt-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-shell/65 transition-colors duration-200 hover:text-shell"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-shell/55">
              Account
            </h3>
            <ul className="mt-3 space-y-0.5">
              {ACCOUNT_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-shell/65 transition-colors duration-200 hover:text-shell"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-shell/55">
              Company
            </h3>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center text-sm text-shell/65 transition-colors duration-200 hover:text-shell"
                >
                  Home
                </Link>
              </li>
              {SECTION_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-shell/65 transition-colors duration-200 hover:text-shell"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-shell/10 py-6 text-xs text-shell/55 md:flex-row md:items-center md:justify-between">
          <span>© 2026 GrowthAds</span>
          <span>Lagos, Nigeria</span>
          <span>NGN · Paystack</span>
          <span className="text-shell/55">Built for the Monday report.</span>
        </div>
      </div>
    </footer>
  );
}

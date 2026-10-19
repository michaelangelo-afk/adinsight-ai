import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { TextureGrain } from "@/components/motion/texture-grain";

export const metadata: Metadata = {
  title: "Sign in — GrowthAds",
  description: "Sign in to your GrowthAds dashboard."
};

/**
 * Auth shell.
 *
 * The left panel is the back cover of the statement: an ink sheet, a ruled
 * masthead, the promise in editorial type, and three audited facts. The old
 * version scaled the ink logo mark onto a near-black scene (effectively
 * invisible) and repeated the retired "plant money" headline.
 */
export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-ink-950 lg:flex-row">
      <aside className="auth-scene-bg-dark relative hidden w-5/12 flex-col justify-between overflow-hidden border-r border-paper-100/15 p-12 text-paper-50 lg:flex">
        <div aria-hidden className="absolute inset-0 grid-bg opacity-30" />
        <TextureGrain />

        {/* Masthead */}
        <div className="relative z-10 flex items-center justify-between border-b border-paper-100/25 pb-4">
          <Logo onInk />
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-brand-200">
            NGN · Paystack
          </span>
        </div>

        {/* Promise */}
        <div className="relative z-10 my-auto max-w-sm">
          <span className="kicker text-brand-200">The monthly statement</span>
          <h2 className="display mt-4 text-5xl leading-[0.98] text-paper-50">
            Your spend,
            <br />
            <span className="italic text-brand-200">itemised.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-mist-200">
            Meta, Google and TikTok read every night. What grew, what burned,
            and the three moves that follow — one page, every Monday.
          </p>
        </div>

        {/* Audited facts, ruled like a ledger footer. */}
        <dl className="relative z-10 border-t border-paper-100/25">
          {[
            ["01", "OAuth-secured connections"],
            ["02", "Billed in naira, no conversion"],
            ["03", "Every automation logged"]
          ].map(([n, label]) => (
            <div
              key={n}
              className="flex items-baseline gap-3 border-b border-paper-100/15 py-2.5 last:border-b-0"
            >
              <dt className="num text-xs text-mist-400">{n}</dt>
              <dd className="font-mono text-xs uppercase tracking-[0.1em] text-mist-200">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

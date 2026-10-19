import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { TextureGrain } from "@/components/motion/texture-grain";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in — GrowthAds",
  description: "Sign in to your GrowthAds dashboard."
};

/**
 * Auth shell — the same dark, glow-lit surface as the marketing page.
 *
 * Left: brand panel on #05070B with an emerald bloom, a white-fade headline
 * and three audited facts. Right: the light form column, so inputs and error
 * states keep the app's contrast.
 */
export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 lg:flex-row">
      <aside className="auth-scene-bg-dark relative hidden w-5/12 flex-col justify-between overflow-hidden border-r border-white/10 p-12 text-white lg:flex">
        <TextureGrain />

        <div className="relative z-10 flex items-center justify-between">
          <Logo onInk />
          <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/55">
            NGN · Paystack
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-sm">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            The Monday report
          </span>
          <h2 className="headline-fade mt-5 text-5xl font-medium leading-[1.05]">
            Your spend,
            <br />
            <span className="accent-text">itemised.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/55">
            Meta, Google and TikTok read every night. What grew, what burned,
            and the three moves that follow — one page, every Monday.
          </p>
        </div>

        <ul className="relative z-10 space-y-2.5">
          {[
            "OAuth-secured platform connections",
            "Billed in naira, no conversion",
            "Every automation logged"
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-white/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                <Check size={12} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { TextureGrain } from "@/components/motion/texture-grain";
import { ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign in — GrowthAds",
  description: "Sign in to your GrowthAds dashboard."
};

export default function LoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-50 dark:bg-ink-950">
      {/* LEFT — premium brand scene. Visible on lg+. Hides on mobile
          so the form fits a narrow viewport comfortably. */}
      <aside className="relative hidden lg:flex w-5/12 flex-col justify-between overflow-hidden p-12 auth-scene-bg-dark text-white">
        {/* Static calm backdrop: grid + grain. */}
        <div aria-hidden className="absolute inset-0 grid-bg opacity-30" />
        <TextureGrain />

        {/* Top: brand mark + sparkles chip */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span>Growth</span>
            <span className="text-brand-300">Ads</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-200">
            <Sparkles size={11} />
            Nigerian-first
          </span>
        </div>

        {/* Middle: animated logo + orbiters + headline */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto">
          <div className="relative my-auto">
            <Logo showWordmark={false} className="mx-auto h-40 w-40 [&>span]:h-full [&>span]:w-full [&>svg]:h-28 [&>svg]:w-28" />
          </div>
          <h2 className="mt-12 text-3xl font-bold tracking-tight text-white max-w-sm leading-tight ">
            Plant money on ads
            <br />
            that <span className="gradient-text">grow.</span>
          </h2>
          <p
            className="mt-4 text-sm leading-relaxed text-brand-100/80 max-w-[20rem] "
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            Multi-platform analytics, rule-based automations, and AI
            recommendations for Nigerian SMEs spending on Meta, Google, and
            TikTok.
          </p>
        </div>

        {/* Bottom: trust strip */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-brand-100/70">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-brand-400" />
            Paystack-secured
          </span>
          <span className="text-brand-400/40">•</span>
          <span>Naira-billed, .ng-first</span>
        </div>
      </aside>

      {/* RIGHT — form column. Visible always; full width on mobile. */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

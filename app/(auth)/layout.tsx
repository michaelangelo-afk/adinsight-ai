import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { AuroraOrbsBackground } from "@/components/motion/aurora-orbs-background";
import { ParticleField } from "@/components/motion/particle-field";
import { AnimatedLogo } from "@/components/motion/animated-logo";
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
        <AuroraOrbsBackground variant="dark" intensity={0.9} />
        <ParticleField count={50} variant="dark" seed={911} />

        {/* Top: brand mark + sparkles chip */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span>Growth</span>
            <span className="text-emerald-300">Ads</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
            <Sparkles size={11} />
            Nigerian-first
          </span>
        </div>

        {/* Middle: animated logo + orbiters + headline */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto">
          <AnimatedLogo
            size={160}
            orbiters={[
              { content: "₦", duration: 9, phase: 0 },
              { content: "%", duration: 12, phase: 120 },
              { content: "▲", duration: 10, phase: 240 }
            ]}
          />
          <h2 className="mt-12 text-3xl font-bold tracking-tight text-white max-w-sm leading-tight animate-fade-up">
            Plant money on ads
            <br />
            that <span className="gradient-text">grow.</span>
          </h2>
          <p
            className="mt-4 text-sm leading-relaxed text-emerald-100/80 max-w-[20rem] animate-fade-up"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            Multi-platform analytics, rule-based automations, and AI
            recommendations for Nigerian SMEs spending on Meta, Google, and
            TikTok.
          </p>
        </div>

        {/* Bottom: trust strip */}
        <div className="relative z-10 flex items-center gap-4 text-[11px] text-emerald-100/70">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Paystack-secured
          </span>
          <span className="text-emerald-400/40">•</span>
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

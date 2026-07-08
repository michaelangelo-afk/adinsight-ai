import { LinkButton } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

export function Cta() {
  return (
    <section
      className="
        relative py-20 md:py-28
        bg-surface-50 dark:bg-ink-950
      "
    >
      <div className="absolute inset-0 bg-glow-emerald blur-3xl opacity-50 dark:opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div
          className="
            relative overflow-hidden rounded-3xl border shadow-card-elevated
            bg-white border-mist-200
            dark:bg-ink-900 dark:border-ink-700 dark:shadow-card-elevated-dark
          "
        >
          {/* Soft brand gradient overlay */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-brand-gradient-soft
            "
          />
          {/* Top accent line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient" />

          <div className="relative grid md:grid-cols-[1.4fr,1fr] items-center gap-8 p-10 md:p-14">
            <div>
              <span
                className="
                  chip
                  bg-violet-700/10 border border-violet-700/30 text-violet-700 dark:text-violet-300 dark:border-violet-400/30 dark:bg-violet-400/10
                  dark:bg-violet-700/15 dark:border-violet-700/30 dark:text-violet-300
                "
              >
                <Sparkles />
                Start growing today
              </span>
              <h2
                className="
                  mt-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight
                  text-mist-600 dark:text-mist-50
                "
              >
                Ready to grow
                <br />
                with every <span className="gradient-text">naira?</span>
              </h2>
              <p
                className="
                  mt-4 max-w-xl leading-relaxed
                  text-mist-600 dark:text-mist-300
                "
              >
                Join Nigerian SMEs already using GrowthAds to cut wasted ad
                spend, automate the busywork, and deploy winning campaigns
                across Meta, Google, and TikTok — from one dashboard.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <LinkButton
                  href="/dashboard"
                  variant="primary"
                  size="lg"
                  className="shadow-glow-emerald"
                >
                  Start free 14-day trial
                  <ArrowRight size={16} />
                </LinkButton>
                <LinkButton
                  href="#"
                  aria-label="Chat on WhatsApp (demo link — phone number configured post-launch)"
                  variant="outline"
                  size="lg"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                  <span
                    aria-hidden="true"
                    className="
                      text-[10px] font-semibold uppercase tracking-wider
                      text-mist-600 border border-mist-300 rounded px-1.5 py-0.5
                      dark:text-mist-300 dark:border-mist-600
                    "
                  >
                    demo
                  </span>
                </LinkButton>
              </div>
            </div>
            <div className="md:justify-self-end">
              <div
                className="
                  rounded-2xl p-6 max-w-xs border
                  bg-surface-100 border-mist-200
                  dark:bg-ink-850 dark:border-ink-700
                "
              >
                <div
                  className="
                    flex items-center gap-2 text-xs uppercase tracking-wider font-semibold
                    text-mist-500 dark:text-mist-400
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse-soft" />
                  Nigeria-first support
                </div>
                <div className="mt-2 text-2xl font-bold text-mist-600 dark:text-mist-50">
                  We&apos;re online.
                </div>
                <p className="mt-2 text-sm text-mist-600 dark:text-mist-300">
                  Talk to a real person on WhatsApp. Pidgin, English, Yoruba
                  &mdash; we dey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

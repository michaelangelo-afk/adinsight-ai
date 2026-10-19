import { LinkButton } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PatternField, SignalRings } from "@/components/landing/pattern-field";

/**
 * Closing CTA.
 *
 * One centered glass panel with an emerald bloom behind it — the same
 * product-first, softly-lit language as the hero. No inverted ink sheet, no
 * stamps: the page stays dark edge to edge, and the panel is the brightest
 * thing on it.
 */
export function Cta() {
  return (
    <section id="contact" className="relative isolate overflow-hidden py-section md:py-section-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-brand-500/15 blur-3xl"
      />

      <div className="mx-auto max-w-content px-gutter lg:px-gutter-lg">
        <div className="relative overflow-hidden rounded-3xl border border-shell/10 bg-shell/[0.025] px-6 py-14 text-center sm:px-12 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.22),transparent_70%)]"
          />
          <PatternField motif="grid" mask="radial" className="inset-0" opacity={60} />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center text-accent/50">
            <SignalRings rings={6} step={72} className="relative h-[720px] w-[720px] opacity-60" />
          </div>

          <div className="relative">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Start growing
            </span>

            <h2 className="headline-fade mx-auto mt-6 max-w-2xl text-5xl md:text-6xl">
              Close the month knowing where every naira went.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-shell/55">
              Connect your platforms once. GrowthAds reads the numbers nightly,
              pauses what wastes money, and puts the next three moves in front of
              you before Monday.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton
                href="/signup"
                variant="white"
                size="lg"
                className="group w-full sm:w-auto"
              >
                Start free 14-day trial
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </LinkButton>

              <LinkButton
                href="#"
                aria-label="Chat on WhatsApp (demo link — phone number configured post-launch)"
                variant="glass"
                size="lg"
                className="w-full sm:w-auto"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
                <span
                  aria-hidden="true"
                  className="ml-1 rounded-full border border-shell/15 px-2 py-0.5 text-xs text-shell/55"
                >
                  demo
                </span>
              </LinkButton>
            </div>

            <p className="mt-5 text-xs text-shell/55">
              No card required · Paystack-billed in Naira · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

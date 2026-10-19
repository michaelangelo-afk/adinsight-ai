import { LinkButton } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

/**
 * Back page.
 *
 * The closing block inverts the stock: an ink sheet inside the paper page, so
 * the last thing on screen reads as the stamped, filed end of a document. The
 * CTA inside it is deliberately a light stamp rather than a dark button — the
 * colour hierarchy of the page flips here, once.
 */
export function Cta() {
  return (
    <section
      id="contact"
      className="ink-block relative overflow-hidden border-t border-paper-100/25"
    >
      {/* Crop marks — printer's registration, not decoration. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l border-t border-paper-100/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b border-r border-paper-100/40"
      />

      <div className="relative mx-auto max-w-content px-gutter py-16 md:py-24 lg:px-gutter-lg">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <span className="kicker text-brand-200">05 — File your first statement</span>

            <h2 className="display mt-5 max-w-[18ch] text-5xl leading-[0.95] text-paper-50 md:text-7xl">
              Close the month knowing where every{" "}
              <span className="italic text-brand-200">naira</span> went.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-mist-200">
              Join the Nigerian teams who stopped reconciling five ad managers
              by hand. Connect once, and Monday arrives with the numbers already
              added up — and the decisions already ranked.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Ghost + explicit overrides: inside the ink band the primary
                  button must invert, and the `!` keeps that true regardless of
                  Tailwind's generated rule order. */}
              <LinkButton
                href="/signup"
                variant="ghost"
                size="lg"
                className="
                  group !border-paper-50 !bg-paper-50 !text-ink-950
                  hover:!border-brand-200 hover:!bg-brand-200
                "
              >
                Start free 14-day trial
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </LinkButton>

              <LinkButton
                href="#"
                aria-label="Chat on WhatsApp (demo link — phone number configured post-launch)"
                variant="ghost"
                size="lg"
                className="!border-paper-100/50 !text-paper-50 hover:!bg-paper-50/10"
              >
                <MessageCircle size={15} strokeWidth={1.5} />
                Chat on WhatsApp
                <span
                  aria-hidden="true"
                  className="ml-1 border border-paper-100/40 px-1.5 py-0.5 font-mono text-xs uppercase tracking-[0.12em] text-mist-300"
                >
                  demo
                </span>
              </LinkButton>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-paper-100/30">
              <div className="flex items-baseline justify-between gap-4 border-b border-paper-100/20 py-3">
                <span className="kicker text-mist-300">Desk</span>
                <span className="num text-xs text-paper-50">Lagos · Nigeria</span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-paper-100/20 py-3">
                <span className="kicker text-mist-300">Hours</span>
                <span className="num text-xs text-paper-50">Mon–Fri 09:00–18:00</span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-paper-100/20 py-3">
                <span className="kicker text-mist-300">Zone</span>
                <span className="num text-xs text-paper-50">WAT · GMT+1</span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-paper-100/20 py-3">
                <span className="kicker text-mist-300">Reply</span>
                <span className="num text-xs text-paper-50">Within one hour</span>
              </div>
            </div>

            {/* The red pen appears one last time, as a stamp on the back page. */}
            <div className="mt-6 flex items-start gap-3">
              <span
                className="
                  -rotate-2 border border-ledger-300 px-2 py-1 font-mono text-xs
                  font-medium uppercase tracking-[0.14em] text-ledger-300
                "
              >
                We reply
              </span>
              <p className="max-w-[24ch] text-xs leading-relaxed text-mist-300">
                Pidgin, English, Yoruba — a real person, not a ticket number.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

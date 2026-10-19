import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { StatsMarquee } from "@/components/landing/stats-marquee";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { Pricing } from "@/components/landing/pricing";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Keyboard users land here first; the link is only visible on focus. */}
      <a
        href="#statement"
        className="
          sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]
          focus:border focus:border-ink-950 focus:bg-paper-50 focus:px-4 focus:py-2
          focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.1em] focus:text-ink-950
        "
      >
        Skip to the statement
      </a>

      <Nav />
      <Hero />
      <StatsMarquee />
      <Features />
      <Workflow />
      <Pricing />
      <Cta />
      <Footer />

      {/* Paper grain sits above the stock but below interaction. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] texture-grain" />
    </main>
  );
}

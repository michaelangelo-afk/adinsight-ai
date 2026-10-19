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
    <main className="shell-dark relative min-h-screen">
      {/* Paints the viewport (including overscroll) dark; the app's <body> is
          light and would otherwise flash white at the rubber-band edges. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 bg-ink-950" />
      <a
        href="#statement"
        className="
          sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]
          focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm
          focus:font-medium focus:text-black
        "
      >
        Skip to content
      </a>

      <Nav />
      <Hero />
      <StatsMarquee />
      <Features />
      <Workflow />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}

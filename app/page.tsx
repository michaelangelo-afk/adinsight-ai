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
    <main className="min-h-screen">
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

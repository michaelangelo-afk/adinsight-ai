import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="text-[120px] md:text-[160px] leading-none font-bold gradient-text">
          404
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-mist-50 tracking-tight">
          This page is off-grid.
        </h1>
        <p className="mt-3 text-mist-300 max-w-md mx-auto">
          The link you followed is broken, expired, or never existed. Head back
          to the homepage or jump into your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/" variant="primary">
            Back to homepage
          </LinkButton>
          <LinkButton href="/dashboard" variant="secondary">
            Open dashboard
          </LinkButton>
        </div>
      </div>
    </main>
  );
}

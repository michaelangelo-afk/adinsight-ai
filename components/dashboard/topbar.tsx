// components/dashboard/topbar.tsx
//
// Dashboard top-bar — sticky glass header with brand on the left,
// horizontal nav strip in the centre, utility cluster on the right.
//
// Phase 6 changes (this rewrite):
//   1. Converted to a client component (`"use client"`) so it can
//      consume `usePathname()` + share the active-state helper with
//      `components/dashboard/sidebar.tsx`. The previous version was a
//      server component that only knew about a single "Overview"
//      breadcrumb — on tablets and narrow laptops the sidebar is
//      `hidden lg:flex` and there was zero route to /influencers /
//      /recommendations / /reports / /billing. The horizontal strip
//      below is the fix.
//   2. The strip imports `NAV_ITEMS` + `isNavActive` from
//      `lib/dashboard/nav.ts` — same source as the sidebar, so the
//      two surfaces can never drift and the active link highlights
//      identically on both.
//   3. `aria-current="page"` on the active nav link is the canonical
//      screen-reader affordance. Each link also carries an explicit
//      `aria-label` + `title` so the icon+label cluster reads
//      correctly when focused by SR users.
//
// At `lg+` the sidebar still owns the primary visual; the topbar strip
// remains visible as a quick-jump rail. Below `md` (phone) the strip is
// hidden — see suggest_followups for a follow-up hamburger menu.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  ChevronDown,
  Menu,
  Search,
  X
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_ITEMS, isNavActive } from "@/lib/dashboard/nav";
import { cn } from "@/lib/utils";

export interface TopbarProfile {
  /** 1–3 letter initials or single character shown in the avatar circle */
  avatar: string;
  fullName: string;
  businessName: string;
}

export function Topbar({ profile }: { profile: TopbarProfile }) {
  const pathname = usePathname();
  // Mobile-nav sheet open state. Phones (<sm, 640px) have neither the
  // sidebar rail (lg+) nor the horizontal nav strip (sm+) — before
  // this state, there was literally no way to reach /influencers /
  // /recommendations / /reports / /billing from a phone-sized
  // dashboard viewport. The hamburger below toggles this; the
  // pathname effect auto-closes it on successful navigation so the
  // sheet doesn't linger over the destination page.
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Auto-close the sheet whenever the active route changes — a
  // successful Next.js client-side route swap means the user just
  // tapped a link, so the menu should disappear instead of covering
  // the new page's content with the old menu state.
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Esc-key close — keyboard / SR users can dismiss the sheet without
  // reaching for the close button. Listener is only attached while the
  // sheet is open so the cost is one keydown check at most.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-mist-50/[0.04]">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center gap-3 md:gap-4">
        {/* Brand — Logo + breadcrumb. The Logo is essential on screens
            where the sidebar is hidden (below lg) so the brand is
            visible at every breakpoint. Same Logo component the landing
            nav uses; the SVG adapts to light/dark via `dark:` overrides
            in the Logo component itself. */}
        <Link
          href="/"
          className="
            shrink-0 rounded-lg transition-all duration-200
            hover:opacity-90 active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-violet-300/70 focus-visible:ring-offset-2
            focus-visible:ring-offset-ink-950
          "
          aria-label="GrowthAds home"
        >
          <Logo />
        </Link>

        {/* Hamburger — visible ONLY on phones (<sm). The horizontal
            nav strip below takes over at sm+ (Phase 7 lower the
            breakpoint from md to sm, AND added a hamburger sheet so
            the Influencers / Reports / Recommendations entries are
            equally reachable from a 360px viewport as they are from
            a 1440px one). aria-expanded / aria-controls wire the
            button to the sheet below for screen readers. */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist-50/[0.04] hairline text-mist-200 hover:bg-mist-50/[0.08] hover:border-violet-500/40 transition-all duration-200 tap-press touch-target"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Breadcrumb kept as a quieter secondary line under the Logo */}
        <div className="hidden md:flex items-center gap-2 ml-2 text-sm">
          <Link
            href="/dashboard"
            className="text-slate-400 dark:text-mist-400 hover:text-slate-700 dark:hover:text-mist-200 transition-colors"
          >
            /
          </Link>
          <div className="text-sm font-medium text-slate-800 dark:text-mist-100">Overview</div>
        </div>

        {/* Phase 6 — Horizontal nav strip. Visible at md and above so
            the dashboard pages have a persistent top nav even when the
            left sidebar is hidden (below `lg`, ~1024px). Identical
            active-state styling to the sidebar (violet-500/15 bg +
            mist-50 text) so users see WHERE they are on either
            surface. aria-current="page" lights up the active link for
            screen readers. Each <Link> uses Next.js client routing +
            prefetch for snappier navigation than plain anchors. */}
        <nav
          aria-label="Main navigation"
          className="
            hidden sm:flex items-center gap-1 rounded-xl
            bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 px-1.5 py-1
            mx-2 lg:mx-4
          "
        >
          {NAV_ITEMS.map((n) => {
            const Icon = n.icon;
            const active = isNavActive(pathname, n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={active ? "page" : undefined}                  aria-label={n.label}
                  title={n.label}
                  onClick={(e) => {
                    if (n.stub) e.preventDefault();
                  }}
                  className={cn(
                    "tap-press touch-target group inline-flex items-center gap-1.5 rounded-lg px-2 lg:px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                    active
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-mist-50"
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-mist-300 dark:hover:bg-mist-50/[0.06] dark:hover:text-mist-50",
                    n.stub && "opacity-70"
                  )}
                >
                  <Icon
                    size={14}
                    className={cn(
                      "shrink-0 transition-transform duration-200",
                      active
                        ? "text-violet-700 dark:text-violet-300"
                        : "group-hover:scale-110 group-hover:text-violet-700 dark:group-hover:text-violet-300"
                    )}
                  />
                  {/* Phase 6 viewport fix — labels were crowding the
                      768px md row visually. Icons-only at md (so even
                      on narrow tablets 6 chips fit), full label tips
                      in at lg+. Badge pills are reserved for xl+
                      where horizontal space is plentiful. The
                      aria-label / title above carry the full label
                      for screen readers at every breakpoint. */}
                  <span className="hidden lg:inline">{n.label}</span>
                  {n.badge !== undefined && (
                    <span className="hidden xl:inline-flex ml-0.5 items-center justify-center rounded-md bg-violet-500 px-1.5 h-4 text-[9px] font-semibold text-white animate-pulse-soft">
                      {n.badge}
                    </span>
                  )}
                </Link>
            );
          })}
        </nav>

        {/* Spacer — on phones the horizontal nav is hidden; the
            spacer pushes the utility cluster to the right. */}
        <div className="flex-1 md:flex-initial" />

        {/* Date range pill */}
        <button type="button" className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 text-sm text-slate-700 dark:text-mist-200 hover:bg-slate-200/70 dark:hover:bg-mist-50/[0.08] hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <Calendar size={14} className="transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300" />
          Last 30 days
          <ChevronDown size={14} className="text-slate-400 dark:text-mist-400 transition-transform group-hover:rotate-180 duration-300" />
        </button>

        {/* Search */}
        <button type="button" className="hidden lg:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 text-sm text-slate-500 dark:text-mist-300 w-64 hover:bg-slate-200/70 dark:hover:bg-mist-50/[0.08] hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <Search size={14} className="transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300" />
          <span className="text-slate-500 dark:text-mist-500">Search campaigns…</span>
          <kbd className="ml-auto text-[10px] text-slate-500 dark:text-mist-500 px-1.5 py-0.5 rounded bg-white dark:bg-ink-900 border border-mist-200 dark:border-transparent group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle — same ThemeToggle as the landing nav. Sits
            alongside the other header controls so light/dark switching
            is reachable from the persisted header, not just landing.
            ThemeToggle is already a self-styled 44px touch-target with
            its own bg + border, so no outer wrapper is needed — adding
            one would visually swamp the button's own affordance. */}
        <ThemeToggle />

        {/* Notifications */}
        <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 text-slate-600 dark:text-mist-200 hover:bg-slate-200/70 dark:hover:bg-mist-50/[0.08] hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-200 tap-press touch-target">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-ink-950 animate-pulse-soft" />
        </button>

        {/* Profile */}
        <button type="button" className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-1.5 bg-slate-100 dark:bg-mist-50/[0.04] border border-mist-200 dark:border-mist-50/10 hover:bg-slate-200/70 dark:hover:bg-mist-50/[0.08] hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-semibold text-white shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-300">
            {profile.avatar || "?"}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-medium text-slate-900 dark:text-mist-50">
              {profile.fullName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-mist-400">
              {profile.businessName}
            </span>
          </div>
          <ChevronDown size={12} className="text-slate-400 dark:text-mist-400 hidden md:block transition-transform group-hover:rotate-180 duration-300" />
        </button>
      </div>

      {/* Mobile-nav sheet — hamburger-controlled, visible at <sm.
          Slides in DIRECTLY below the topbar header so the user sees
          a single visual seam (no modal overlay over the page body).
          backdrop-blur gives a clean glass feel that matches the
          topbar's own glass surface. The render-guard ensures it
          only contributes DOM cost when open. */}
      {menuOpen && (
        <div
          id="dashboard-mobile-nav"
          className="sm:hidden border-t border-mist-200 dark:border-mist-50/[0.04] bg-white/95 dark:bg-ink-950/85 backdrop-blur-xl"
          role="dialog"
          aria-label="Dashboard navigation"
        >
          <nav
            aria-label="Mobile navigation"
            className="px-3 py-3 space-y-1"
          >
            {NAV_ITEMS.map((n) => {
              const Icon = n.icon;
              const active = isNavActive(pathname, n.href);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={n.label}
                  title={n.label}
                  onClick={(e) => {
                    if (n.stub) e.preventDefault();
                  }}
                  className={cn(
                    "tap-press touch-target group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-mist-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-mist-300 dark:hover:bg-mist-50/[0.06] dark:hover:text-mist-50",
                    n.stub && "opacity-70"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-transform duration-200",
                      active
                        ? "text-violet-700 dark:text-violet-300"
                        : "group-hover:scale-110 group-hover:text-violet-700 dark:group-hover:text-violet-300"
                    )}
                  />
                  <span className="flex-1">{n.label}</span>
                  {n.badge !== undefined && (
                    <span className="inline-flex items-center justify-center rounded-md bg-violet-600 dark:bg-violet-500 px-1.5 h-5 text-[10px] font-semibold text-white animate-pulse-soft">
                      {n.badge}
                    </span>
                  )}
                  {n.stub && (
                    <span
                      className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-mist-600"
                      title="Coming soon"
                    >
                      soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

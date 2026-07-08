import * as React from "react";
import Link from "next/link";
import { Bell, Calendar, ChevronDown, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export interface TopbarProfile {
  /** 1–3 letter initials or single character shown in the avatar circle */
  avatar: string;
  fullName: string;
  businessName: string;
}

export function Topbar({ profile }: { profile: TopbarProfile }) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-mist-50/[0.04]">
      <div className="px-6 md:px-8 py-4 flex items-center gap-4">
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

        {/* Breadcrumb kept as a quieter secondary line under the Logo */}
        <div className="hidden md:flex items-center gap-2 ml-2 text-sm">
          <Link
            href="/dashboard"
            className="text-mist-400 hover:text-mist-200 transition-colors"
          >
            /
          </Link>
          <div className="text-sm font-medium text-mist-100">Overview</div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date range pill */}
        <button type="button" className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-sm text-mist-200 hover:bg-mist-50/[0.08] hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <Calendar size={14} className="transition-colors group-hover:text-violet-300" />
          Last 30 days
          <ChevronDown size={14} className="text-mist-400 transition-transform group-hover:rotate-180 duration-300" />
        </button>

        {/* Search */}
        <button type="button" className="hidden lg:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mist-50/[0.04] hairline text-sm text-mist-300 w-64 hover:bg-mist-50/[0.08] hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <Search size={14} className="transition-colors group-hover:text-violet-300" />
          <span className="text-mist-500">Search campaigns…</span>
          <kbd className="ml-auto text-[10px] text-mist-500 px-1.5 py-0.5 rounded bg-ink-900 group-hover:text-violet-300 transition-colors">
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
        <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist-50/[0.04] hairline text-mist-200 hover:bg-mist-50/[0.08] hover:border-violet-500/40 transition-all duration-200 tap-press touch-target">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-ink-950 animate-pulse-soft" />
        </button>

        {/* Profile */}
        <button type="button" className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-1.5 bg-mist-50/[0.04] hairline hover:bg-mist-50/[0.08] hover:border-violet-500/40 transition-all duration-200 tap-press touch-target group">
          <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-semibold text-white shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-300">
            {profile.avatar || "?"}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-medium text-mist-50">
              {profile.fullName}
            </span>
            <span className="text-[10px] text-mist-400">
              {profile.businessName}
            </span>
          </div>
          <ChevronDown size={12} className="text-mist-400 hidden md:block transition-transform group-hover:rotate-180 duration-300" />
        </button>
      </div>
    </div>
  );
}

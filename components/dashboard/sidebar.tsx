"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS, isNavActive } from "@/lib/dashboard/nav";
import { usePathname } from "next/navigation";

/**
 * Sidebar nav. Phase 4 wires the Influencers entry to the real
 * `/influencers` route and uses Next's `usePathname()` to drive the
 * active state — keeping the dashboard's Overview active when on
 * `/dashboard` AND on any nested filter URL on `/influencers` (so
 * users browsing the influencer sector get the right rail highlight
 * without losing context).
 *
 * Phase 6 — NAV_ITEMS + isNavActive now live in
 * `lib/dashboard/nav.ts` and are SHARED with the Topbar's horizontal
 * nav strip (`components/dashboard/topbar.tsx`). Both surfaces
 * consume the same source so the active state is consistent on
 * either (e.g. expanding the Influencers drawer from /influencers?c=
 * lights the same Influencers entry on both surfaces).
 */
interface SidebarProps {
  /** The signed-in user's organization/business name */
  orgName: string;
}

export function Sidebar({ orgName }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-mist-200 dark:border-mist-50/[0.04] bg-white/80 dark:bg-ink-900/40">
      <div className="px-5 py-5">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </div>

      <div className="px-3">
        <button className="w-full flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 bg-brand-500/15 border border-brand-500/30 text-brand-200 hover:bg-brand-500/25 hover:border-brand-400/50 transition-all duration-200 tap-press touch-target group">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            <span className="truncate max-w-[10rem]">{orgName}</span>
          </span>
          <span className="text-xs uppercase tracking-wider text-brand-300/70 shrink-0 transition-colors group-hover:text-brand-200">
            switch
          </span>
        </button>
      </div>

      <nav
        className="mt-6 px-3 flex-1 space-y-1"
        aria-label="Workspace navigation"
      >
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = isNavActive(pathname, n.href);
          return (
            <Link
              key={n.label}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "nav-indicator group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all duration-200 hover:translate-x-0.5",
                active
                  ? "bg-brand-100 text-brand-900 is-active dark:bg-brand-500/10 dark:text-mist-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-mist-300 dark:hover:bg-mist-50/[0.04] dark:hover:text-mist-50",
                n.stub && "opacity-70 cursor-not-allowed"
              )}
              onClick={(e) => {
                if (n.stub) e.preventDefault();
              }}
            >
              <Icon
                size={16}
                className={cn(
                  "transition-transform duration-300",
                  active
                    ? "text-brand-700 dark:text-brand-300"
                    : "group-hover:scale-110 group-hover:text-brand-700 dark:group-hover:text-brand-300"
                )}
              />
              {n.stub && (
                <span
                  className="text-xs uppercase tracking-wider text-slate-400 ml-auto dark:text-mist-600"
                  title="Coming soon"
                >
                  soon
                </span>
              )}
              <span className={cn("flex-1", n.stub && "ml-auto")}>
                {n.label}
              </span>
              {n.badge !== undefined && (
                <span className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-1.5 h-5 text-xs font-semibold text-white ">
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-brand-100 to-brand-100 border border-brand-200 dark:from-brand-500/15 dark:to-brand-500/15 dark:border-brand-500/30 hover-lift hover:border-brand-400/50 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-brand-500/15 blur-2xl" />
          <div className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-200">
            Pro plan
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-mist-200 leading-relaxed">
            Priority AI insights unlock in <strong className="text-slate-900 dark:text-mist-50">2 days</strong>.
          </p>
          <button className="mt-3 w-full rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-2 tap-press touch-target hover:shadow-[0_0_24px_-4px_rgba(21,128,61,0.7)] transition-shadow duration-300">
            Upgrade
          </button>
        </div>

        {/*
          Server-action form: posts to signOut() and redirects in middleware.
          Server actions can be used directly via <form action={fn}> in
          Next.js 14 without needing a client component.
        */}
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 dark:text-mist-300 dark:hover:text-rose-300 transition-colors duration-200 tap-press touch-target py-1.5 group"
          >
            <LogOut size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

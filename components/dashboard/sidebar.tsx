import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Users,
  Wallet,
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard", active: true },
  { label: "Recommendations", icon: Sparkles, href: "#", badge: 3 },
  { label: "Reports", icon: FileText, href: "#" },
  { label: "Influencers", icon: Users, href: "#" },
  { label: "Billing", icon: Wallet, href: "#" },
  { label: "Settings", icon: Settings, href: "#" }
];

interface SidebarProps {
  /** The signed-in user's organization/business name */
  orgName: string;
}

export function Sidebar({ orgName }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-mist-50/[0.04] bg-ink-900/40">
      <div className="px-5 py-5">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </div>

      <div className="px-3">
        <button className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/25 hover:border-violet-400/50 transition-all duration-200 tap-press touch-target group">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
            <span className="truncate max-w-[10rem]">{orgName}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-violet-300/70 shrink-0 transition-colors group-hover:text-violet-200">
            switch
          </span>
        </button>
      </div>

      <nav className="mt-6 px-3 flex-1 space-y-1">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <a
              key={n.label}
              href={n.href}
              className={cn(
                "nav-indicator group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:translate-x-0.5",
                n.active
                  ? "bg-violet-500/10 text-mist-50 is-active"
                  : "text-mist-300 hover:bg-mist-50/[0.04] hover:text-mist-50"
              )}
            >
              <Icon size={16} className={cn("transition-transform duration-300", n.active ? "text-violet-300" : "group-hover:scale-110 group-hover:text-violet-300")} />
              <span className="flex-1">{n.label}</span>
              {(n as { badge?: number }).badge !== undefined && (
                <span className="inline-flex items-center justify-center rounded-md bg-violet-500 px-1.5 h-5 text-[10px] font-semibold text-white animate-pulse-soft">
                  {(n as { badge?: number }).badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-xl p-4 bg-gradient-to-br from-violet-500/15 to-naira-500/15 border border-violet-500/30 hover-lift hover:border-violet-400/50 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="text-[11px] uppercase tracking-wider text-violet-200">
            Pro plan
          </div>
          <p className="mt-1 text-xs text-mist-200 leading-relaxed">
            Priority AI insights unlock in <strong className="text-mist-50">2 days</strong>.
          </p>
          <button className="mt-3 w-full rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2 tap-press touch-target hover:shadow-[0_0_24px_-4px_rgba(167,139,250,0.7)] transition-shadow duration-300">
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
            className="flex items-center gap-2 text-sm text-mist-300 hover:text-rose-300 transition-colors duration-200 tap-press touch-target py-1.5 group"
          >
            <LogOut size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

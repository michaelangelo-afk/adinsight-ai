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
        <button className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/20 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Plus size={16} />
            <span className="truncate max-w-[10rem]">{orgName}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-violet-300/70 shrink-0">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                n.active
                  ? "bg-violet-500/10 text-mist-50"
                  : "text-mist-300 hover:bg-mist-50/[0.04] hover:text-mist-50"
              )}
            >
              <Icon size={16} className={n.active ? "text-violet-300" : ""} />
              <span className="flex-1">{n.label}</span>
              {(n as { badge?: number }).badge !== undefined && (
                <span className="inline-flex items-center justify-center rounded-md bg-violet-500 px-1.5 h-5 text-[10px] font-semibold text-white">
                  {(n as { badge?: number }).badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-xl p-4 bg-gradient-to-br from-violet-500/15 to-naira-500/15 border border-violet-500/30">
          <div className="text-[11px] uppercase tracking-wider text-violet-200">
            Pro plan
          </div>
          <p className="mt-1 text-xs text-mist-200 leading-relaxed">
            Priority AI insights unlock in <strong className="text-mist-50">2 days</strong>.
          </p>
          <button className="mt-3 w-full rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2">
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
            className="flex items-center gap-2 text-sm text-mist-300 hover:text-mist-50 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

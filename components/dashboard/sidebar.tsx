"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ChevronsUpDown,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS, isNavActive } from "@/lib/dashboard/nav";

/**
 * Sidebar — the workspace rail (lg+).
 *
 * One job: orientation. The rail carries the product mark, the signed-in
 * workspace, the seven destinations, and the account footer. No promo tiles in
 * the nav flow; the plan nudge sits at the bottom as a quiet card, and the only
 * saturated surface is the workspace switcher's focus state.
 *
 * Below `lg` the rail is hidden and the Topbar's hamburger sheet takes over.
 */
interface SidebarProps {
  /** The signed-in user's organization/business name */
  orgName: string;
  /** Display name for the account footer (optional — demo mode has none). */
  userName?: string;
}

export function Sidebar({ orgName, userName = "Demo user" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-white/[0.06] bg-[#070B13] lg:flex">
      <div className="px-4 pb-2 pt-5">
        <Link
          href="/"
          className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          aria-label="GrowthAds home"
        >
          <Logo />
        </Link>
      </div>

      {/* Workspace switcher — the reference's org context sits directly under
          the mark, not buried in a settings menu. */}
      <div className="px-3 pt-3">
        <button
          type="button"
          className="group flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 text-left transition-colors duration-150 hover:border-white/[0.14] hover:bg-white/[0.05]"
          title={`${orgName} — workspace`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-brand-500/[0.14] text-[10px] font-semibold uppercase text-brand-300">
            {orgName.slice(0, 2)}
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-mist-100">
            {orgName}
          </span>
          <ChevronsUpDown
            size={13}
            className="shrink-0 text-mist-500 transition-colors group-hover:text-mist-200"
            aria-hidden
          />
        </button>
      </div>

      <nav
        className="mt-6 flex-1 space-y-0.5 px-3"
        aria-label="Workspace navigation"
      >
        <div className="stat-label px-2 pb-2">Workspace</div>
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const active = isNavActive(pathname, n.href);
          return (
            <Link
              key={n.label}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "nav-indicator group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors duration-150",
                active
                  ? "is-active bg-white/[0.06] font-medium text-mist-50"
                  : "text-mist-400 hover:bg-white/[0.03] hover:text-mist-100",
                n.stub && "cursor-not-allowed opacity-60"
              )}
              onClick={(e) => {
                if (n.stub) e.preventDefault();
              }}
            >
              <Icon
                size={15}
                strokeWidth={1.75}
                aria-hidden
                className={cn(
                  "shrink-0 transition-colors duration-150",
                  active
                    ? "text-brand-300"
                    : "text-mist-500 group-hover:text-mist-300"
                )}
              />
              <span className="flex-1 truncate">{n.label}</span>
              {n.stub && (
                <span className="text-[9px] uppercase tracking-[0.08em] text-mist-600">
                  soon
                </span>
              )}
              {n.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-brand-500/20 text-brand-200"
                      : "bg-white/[0.07] text-mist-300"
                  )}
                >
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-3">
        {/* Connection state — always visible so "is this live?" is answerable
            from anywhere in the workspace. */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400/50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
          </span>
          <span className="text-[11px] font-medium text-mist-300">
            Connected
          </span>
          <span className="ml-auto text-[11px] text-mist-500">Meta Ads</span>
        </div>

        {/* Plan nudge — deliberately the quietest card in the rail. */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-mist-200">
              Pro plan
            </span>
            <span className="rounded bg-brand-500/[0.12] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-brand-300">
              Trial
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-mist-500">
            Priority insights unlock in 2 days.
          </p>
          <Link
            href="/billing"
            className="mt-2.5 flex h-7 w-full items-center justify-center gap-1 rounded-md bg-brand-600 text-[11px] font-semibold text-white transition-colors hover:bg-brand-500"
          >
            <Plus size={11} aria-hidden />
            Upgrade
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/[0.16] text-[10px] font-semibold text-brand-200">
            {userName
              .split(" ")
              .map((p) => p[0] ?? "")
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[11.5px] font-medium text-mist-100">
              {userName}
            </div>
            <div className="truncate text-[10.5px] text-mist-500">
              {orgName}
            </div>
          </div>
          <Link
            href="/"
            aria-label="Back to site"
            title="Back to site"
            className="rounded-md p-1.5 text-mist-500 transition-colors hover:bg-white/[0.05] hover:text-mist-100"
          >
            <ArrowLeft size={13} aria-hidden />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-mist-500 transition-colors hover:bg-white/[0.05] hover:text-rose-300"
            >
              <LogOut size={13} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

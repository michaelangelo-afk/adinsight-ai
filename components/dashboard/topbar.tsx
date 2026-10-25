"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS, isNavActive } from "@/lib/dashboard/nav";
import { cn } from "@/lib/utils";

export interface TopbarProfile {
  /** 1–3 letter initials shown in the avatar circle */
  avatar: string;
  fullName: string;
  businessName: string;
}

/**
 * Topbar — the workspace's quiet chrome.
 *
 * The rail already owns navigation, so the topbar does not duplicate it. It
 * carries location (workspace / section), the account chip and notifications.
 * Below `lg` the rail is gone, so a hamburger opens the same nav as a sheet —
 * that is the only place navigation appears here.
 *
 * Earlier versions stacked a logo, breadcrumb, seven-item nav strip, date pill,
 * search stub and theme toggle into this row; the noise is what made the app
 * read as a template. Stub controls were removed rather than styled.
 */
export function Topbar({ profile }: { profile: TopbarProfile }) {
  const pathname = usePathname();
  const activeNav = NAV_ITEMS.find((n) => isNavActive(pathname, n.href));
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#060911]/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6 lg:px-8">
        {/* Mobile brand + sheet toggle (rail is hidden below lg). */}
        <Link
          href="/"
          className="shrink-0 rounded-lg lg:hidden"
          aria-label="GrowthAds home"
        >
          <Logo />
        </Link>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="workspace-mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-mist-300 transition-colors hover:bg-white/[0.06] hover:text-mist-50 lg:hidden"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Location */}
        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <span className="text-[12px] text-mist-500">Workspace</span>
          <span className="text-mist-600" aria-hidden>
            /
          </span>
          <span className="truncate text-[12.5px] font-medium text-mist-100">
            {activeNav?.label ?? "Overview"}
          </span>
        </div>
        <div className="min-w-0 lg:hidden">
          <span className="truncate text-[13px] font-medium text-mist-100">
            {activeNav?.label ?? "Overview"}
          </span>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-mist-400 transition-colors hover:bg-white/[0.05] hover:text-mist-100"
        >
          <Bell size={15} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-transparent pl-1 pr-2 transition-colors hover:border-white/[0.08] hover:bg-white/[0.03]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/[0.16] text-[10px] font-semibold text-brand-200">
            {profile.avatar || "?"}
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-[11.5px] font-medium text-mist-100">
              {profile.fullName}
            </span>
            <span className="text-[10px] text-mist-500">
              {profile.businessName}
            </span>
          </span>
          <ChevronDown
            size={12}
            className="hidden text-mist-500 sm:block"
            aria-hidden
          />
        </button>
      </div>

      {menuOpen && (
        <div
          id="workspace-mobile-nav"
          className="border-t border-white/[0.06] bg-[#070B13] px-3 pb-3 pt-2 lg:hidden"
          role="dialog"
          aria-label="Workspace navigation"
        >
          <div className="mb-2 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/[0.16] text-[10px] font-semibold text-brand-200">
              {profile.avatar || "?"}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12.5px] font-medium text-mist-50">
                {profile.fullName}
              </div>
              <div className="truncate text-[11px] text-mist-500">
                {profile.businessName}
              </div>
            </div>
          </div>

          <nav aria-label="Mobile navigation" className="space-y-0.5">
            {NAV_ITEMS.map((n) => {
              const Icon = n.icon;
              const active = isNavActive(pathname, n.href);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    if (n.stub) e.preventDefault();
                  }}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-white/[0.06] text-mist-50"
                      : "text-mist-400 hover:bg-white/[0.03] hover:text-mist-100",
                    n.stub && "cursor-not-allowed opacity-60"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={active ? "text-brand-300" : "text-mist-500"}
                    aria-hidden
                  />
                  <span className="flex-1">{n.label}</span>
                  {n.badge !== undefined && (
                    <span className="rounded-md bg-white/[0.07] px-1.5 text-[10px] font-semibold text-mist-300">
                      {n.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-mist-400 transition-colors hover:bg-white/[0.03] hover:text-mist-100"
            >
              <span className="flex h-4 w-4 items-center justify-center text-mist-500">
                ⌂
              </span>
              <span className="flex-1">Back to site</span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}

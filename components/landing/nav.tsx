"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ACCOUNT_ITEMS, NAV_ITEMS } from "@/lib/dashboard/nav";
import { ChevronDown, Menu, X } from "lucide-react";

const SECTION_LINKS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" }
];

/**
 * Landing header.
 *
 * Auth is optional, so the header doubles as the app's launcher: the
 * "Workspace" menu lists EVERY dashboard page (the same NAV_ITEMS the
 * in-app sidebar/topbar use), which means no page is reachable only by
 * typing a URL. The mobile sheet mirrors it, plus Home / Sign in /
 * Try for free.
 */
export function Nav() {
  const [open, setOpen] = React.useState(false);
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false);
  const workspaceRef = React.useRef<HTMLDivElement | null>(null);

  // Close the Workspace dropdown on outside click / Escape. Both are
  // attached only while it is open.
  React.useEffect(() => {
    if (!workspaceOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!workspaceRef.current?.contains(e.target as Node)) {
        setWorkspaceOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWorkspaceOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [workspaceOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-content">
        <div className="flex h-16 items-center justify-between gap-3 rounded-full border border-shell/10 bg-shell/[0.045] px-3 pl-4 backdrop-blur-xl sm:gap-4 sm:pl-5">
          <Link
            href="/"
            className="shrink-0 rounded-full"
            aria-label="GrowthAds home"
          >
            <Logo />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main"
          >
            {SECTION_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex min-h-[44px] items-center rounded-full px-3.5 text-sm text-shell/65 transition-colors duration-200 hover:bg-shell/[0.06] hover:text-shell"
              >
                {l.label}
              </a>
            ))}

            {/* Workspace launcher — every in-app page, one click away. */}
            <div className="relative" ref={workspaceRef}>
              <button
                type="button"
                onClick={() => setWorkspaceOpen((v) => !v)}
                aria-expanded={workspaceOpen}
                aria-controls="workspace-menu"
                aria-haspopup="menu"
                className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-sm text-shell/65 transition-colors duration-200 hover:bg-shell/[0.06] hover:text-shell"
              >
                Workspace
                <ChevronDown
                  size={14}
                  className={
                    "transition-transform duration-200 " +
                    (workspaceOpen ? "rotate-180" : "")
                  }
                />
              </button>

              {workspaceOpen && (
                <div
                  id="workspace-menu"
                  role="menu"
                  aria-label="Workspace pages"
                  className="slide-down absolute right-0 top-[calc(100%+10px)] w-64 rounded-3xl border border-shell/10 bg-shellbg/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {NAV_ITEMS.map((n) => {
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        role="menuitem"
                        onClick={() => setWorkspaceOpen(false)}
                        className="group flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-sm text-shell/75 transition-colors duration-200 hover:bg-shell/[0.07] hover:text-shell"
                      >
                        <Icon
                          size={16}
                          className="shrink-0 text-shell/50 transition-colors group-hover:text-shell"
                        />
                        <span className="flex-1">{n.label}</span>
                        {n.badge !== undefined && (
                          <span className="rounded-full bg-shell/10 px-2 py-0.5 text-xs text-shell/70">
                            {n.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="my-1 border-t border-shell/10" />
                  {ACCOUNT_ITEMS.map((n) => {
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        role="menuitem"
                        onClick={() => setWorkspaceOpen(false)}
                        className="group flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-sm text-shell/65 transition-colors duration-200 hover:bg-shell/[0.07] hover:text-shell"
                      >
                        <Icon size={16} className="shrink-0 text-shell/40" />
                        <span className="flex-1">{n.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle tone="shell" />
            <LinkButton
              href="/login"
              variant="ghost"
              size="sm"
              className="text-shell/70 hover:text-shell"
            >
              Sign in
            </LinkButton>
            <LinkButton href="/dashboard" variant="white" size="sm">
              Open dashboard
            </LinkButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle tone="shell" />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-shell/12 text-shell"
              onClick={() => setOpen((s) => !s)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="landing-mobile-menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div
            id="landing-mobile-menu"
            className="slide-down mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-shell/10 bg-shellbg/95 p-3 backdrop-blur-xl lg:hidden"
          >
            {SECTION_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center rounded-2xl px-4 text-sm text-shell/75 hover:bg-shell/[0.06] hover:text-shell"
              >
                {l.label}
              </a>
            ))}

            <div className="mt-2 border-t border-shell/10 pt-2">
              <div className="px-4 py-1.5 text-xs uppercase tracking-wider text-shell/40">
                Every page
              </div>
              {NAV_ITEMS.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-2xl px-4 text-sm text-shell/75 hover:bg-shell/[0.06] hover:text-shell"
                  >
                    <Icon size={16} className="shrink-0 text-shell/50" />
                    <span className="flex-1">{n.label}</span>
                    {n.badge !== undefined && (
                      <span className="rounded-full bg-shell/10 px-2 py-0.5 text-xs text-shell/70">
                        {n.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {ACCOUNT_ITEMS.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-2xl px-4 text-sm text-shell/65 hover:bg-shell/[0.06] hover:text-shell"
                  >
                    <Icon size={16} className="shrink-0 text-shell/40" />
                    <span className="flex-1">{n.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 flex gap-2 border-t border-shell/10 pt-3">
              <LinkButton
                href="/dashboard"
                variant="white"
                size="sm"
                className="flex-1"
              >
                Open dashboard
              </LinkButton>
            </div>
            <p className="px-1 pt-2 text-center text-xs text-shell/45">
              No account needed — every page is browsable.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

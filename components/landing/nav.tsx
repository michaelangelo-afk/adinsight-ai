"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#features", index: "01" },
  { label: "How it works", href: "#workflow", index: "02" },
  { label: "Pricing", href: "#pricing", index: "03" },
  { label: "Contact", href: "#contact", index: "04" }
];

export function Nav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface-50 dark:bg-ink-950">
      {/* Masthead rail — the printed edition line. Hidden on phones, where it
          would eat the fold for information nobody needs twice. */}
      <div className="hidden border-b border-ink-950/15 dark:border-paper-100/15 md:block">
        <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-1.5 lg:px-gutter-lg">
          <span className="kicker text-mist-500">The weekly statement · Issue 01</span>
          <span className="kicker text-mist-500">
            Lagos · WAT · ₦ NGN · Paystack-billed
          </span>
        </div>
      </div>

      <div className="border-b border-ink-950/20 dark:border-paper-100/20">
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-gutter py-3 lg:px-gutter-lg">
          <Link href="/" className="shrink-0" aria-label="GrowthAds home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="
                  group flex min-h-[44px] items-center gap-1.5 font-mono text-xs font-medium
                  uppercase tracking-[0.12em] text-mist-600 transition-colors duration-200
                  hover:text-ink-950 dark:text-mist-300 dark:hover:text-paper-50
                "
              >
                <span className="text-mist-500 group-hover:text-brand-700 dark:text-mist-400 dark:group-hover:text-brand-300">
                  {l.index}
                </span>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <LinkButton href="/login" variant="ghost" size="sm">
              Sign in
            </LinkButton>
            <LinkButton href="/signup" variant="primary" size="sm">
              Start free
            </LinkButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="
                inline-flex h-11 w-11 items-center justify-center border border-ink-950/35
                text-ink-950 transition-colors duration-200 hover:border-brand-700 hover:text-brand-700
                dark:border-paper-100/35 dark:text-paper-50 dark:hover:border-brand-300 dark:hover:text-brand-300
              "
              onClick={() => setOpen((s) => !s)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="slide-down border-b border-ink-950/20 bg-surface-50 dark:border-paper-100/20 dark:bg-ink-950 lg:hidden">
          <nav className="mx-auto max-w-content px-gutter" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="
                  flex items-baseline gap-3 border-b border-ink-950/12 py-4
                  font-display text-xl text-ink-950 dark:border-paper-100/12 dark:text-paper-50
                "
              >
                <span className="font-mono text-xs text-mist-500">{l.index}</span>
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 py-4">
              <LinkButton
                href="/login"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Sign in
              </LinkButton>
              <LinkButton
                href="/signup"
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Start free
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

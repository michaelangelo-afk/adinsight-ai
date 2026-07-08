"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "Platforms", href: "#platforms" },
  { label: "Automations", href: "#automations" },
  { label: "Pricing", href: "#pricing" }
];

export function Nav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div
        className="
          absolute inset-0 -z-10 backdrop-blur-xl
          bg-surface-50/80 border-b border-mist-200/70
          dark:bg-ink-950/80 dark:border-ink-700/60
        "
      />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="
                text-sm font-medium text-mist-600 hover:text-violet-700
                dark:text-mist-200 dark:hover:text-violet-300
                transition-colors
              "
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {/* With real Supabase auth wired up, the buttons should respect the
              actual flows: existing users → /login, new users → /signup. */}
          <LinkButton href="/login" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <LinkButton
            href="/signup"
            variant="primary"
            size="sm"
            className="shadow-glow-emerald"
          >
            Start free
          </LinkButton>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="
              inline-flex h-10 w-10 items-center justify-center rounded-lg
              bg-white border border-mist-300 hover:border-mist-400
              dark:bg-ink-900 dark:border-ink-700
              transition-colors
            "
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="
            md:hidden border-t
            border-mist-200 bg-white/95 backdrop-blur-xl
            dark:border-ink-700 dark:bg-ink-950/95
          "
        >
          <div className="px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="
                  text-sm text-mist-600 hover:text-violet-700
                  dark:text-mist-200 dark:hover:text-violet-300
                  transition-colors
                "
              >
                {l.label}
            </a>
            ))}
            {/* FIX: desktop buttons use <LinkButton> with href="/dashboard". The
                mobile dropdown was using plain <Button> which had no href/onClick
                handler — clicks were silent no-ops. Link buttons + auto-close. */}
            <div className="flex gap-2 pt-2">
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
                className="flex-1 shadow-glow-emerald"
                onClick={() => setOpen(false)}
              >
                Start free
              </LinkButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

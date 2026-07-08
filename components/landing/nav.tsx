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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 py-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="
                relative text-sm font-medium text-mist-600 hover:text-violet-700
                dark:text-mist-200 dark:hover:text-violet-300
                transition-colors duration-200
                after:absolute after:left-0 after:right-0 after:-bottom-1
                after:h-px after:origin-left after:scale-x-0 after:bg-violet-600
                after:transition-transform after:duration-300 after:ease-out
                hover:after:scale-x-100 dark:after:bg-violet-400
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
              inline-flex h-11 w-11 items-center justify-center rounded-lg
              bg-white border border-mist-300 hover:border-violet-400 hover:bg-violet-50
              dark:bg-ink-900 dark:border-ink-700 dark:hover:border-violet-500/60 dark:hover:bg-ink-850
              transition-all duration-200 tap-press touch-target
            "
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="
            md:hidden border-t slide-down
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

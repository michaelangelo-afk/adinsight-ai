"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" }
];

export function Nav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-content">
        <div className="flex h-16 items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.045] px-3 pl-5 backdrop-blur-xl">
          <Link href="/" className="shrink-0" aria-label="GrowthAds home">
            <Logo onInk />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex min-h-[44px] items-center rounded-full px-4 text-sm text-white/65 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <LinkButton href="/login" variant="ghost" size="sm" className="text-white/70 hover:text-white">
              Sign in
            </LinkButton>
            <LinkButton href="/signup" variant="white" size="sm">
              Try for free
            </LinkButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white"
              onClick={() => setOpen((s) => !s)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="slide-down mt-2 rounded-3xl border border-white/10 bg-ink-900/95 p-3 backdrop-blur-xl lg:hidden">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center rounded-2xl px-4 text-sm text-white/75 hover:bg-white/[0.06] hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
              <LinkButton href="/login" variant="glass" size="sm" className="flex-1">
                Sign in
              </LinkButton>
              <LinkButton href="/signup" variant="white" size="sm" className="flex-1">
                Try for free
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

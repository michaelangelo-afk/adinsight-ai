"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, LogIn, Rocket, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Nav for the auth/entry pages (/login, /signup, /onboarding).
 *
 * These three routes used to render with no navigation at all — a logo
 * and a form, nothing else — so a visitor who landed on /onboarding had
 * no in-page route anywhere. The links are the same pages the marketing
 * header exposes; the current one is marked `aria-current="page"` and
 * disabled-looking rather than removed, so the bar doesn't reflow.
 */
const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/login", label: "Sign in", icon: LogIn },
  { href: "/signup", label: "Create account", icon: UserPlus },
  { href: "/onboarding", label: "Get started", icon: Rocket }
];

export function AuthNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Site"
      className="mb-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors duration-200",
              active
                ? "bg-brand-500/15 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                : "text-mist-600 hover:bg-surface-200 hover:text-ink-900 dark:text-mist-400 dark:hover:bg-mist-50/[0.06] dark:hover:text-mist-50"
            )}
          >
            <Icon size={14} aria-hidden className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

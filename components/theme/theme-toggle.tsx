"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export function ThemeToggle({
  /**
   * Forces the light-on-dark treatment. The landing shell is always dark even
   * when the document is in light mode, so the theme-aware `dark:` twin never
   * applies there and the control would render ink-on-near-black.
   */
  onDark = false
}: {
  onDark?: boolean;
}) {
  const { theme, mounted, toggleTheme } = useTheme();
  // Until mounted we don't know the real theme (the FlashThemeScript runs
  // before React, but this client component is excluded from that). Render
  // a single neutral pill so SSR + first-paint cannot mismatch the
  // post-hydration icon flip.
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 tap-press touch-target " +
        (onDark
          ? "border-white/15 text-white/80 hover:border-brand-300/60 hover:text-white"
          : "border-ink-950/35 text-ink-950 hover:border-brand-700 hover:text-brand-700 dark:border-paper-100/35 dark:text-paper-50 dark:hover:border-brand-300 dark:hover:text-brand-300")
      }
    >
      {/* Animated sun/moon: each icon spins in from outside the visible disc while the other spins out */}
      <Sun
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden
      />
      <Moon
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 transition-all duration-300 ease-out ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden
      />
    </button>
  );
}

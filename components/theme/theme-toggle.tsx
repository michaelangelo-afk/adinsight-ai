"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/theme-provider";

export function ThemeToggle() {
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
      className="
        relative inline-flex h-11 w-11 items-center justify-center rounded-lg
        bg-white border border-mist-300 hover:border-violet-400 hover:bg-violet-50 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.35)]
        dark:bg-ink-900 dark:border-ink-700 dark:hover:border-violet-500/60 dark:hover:bg-ink-850
        transition-all duration-200 tap-press touch-target
      "
    >
      {/* Animated sun/moon: each icon spins in from outside the visible disc while the other spins out */}
      <Sun
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 text-amber-500 transition-all duration-300 ease-out drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden
      />
      <Moon
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 text-violet-300 transition-all duration-300 ease-out drop-shadow-[0_0_6px_rgba(167,139,250,0.4)] ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden
      />
    </button>
  );
}

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
        relative inline-flex h-10 w-10 items-center justify-center rounded-lg
        bg-white border border-mist-300 hover:border-mist-400 hover:bg-mist-50
        dark:bg-ink-900 dark:border-ink-700 dark:hover:border-violet-700/40 dark:hover:bg-ink-850
        transition-all duration-200
      "
    >
      {/* Animated sun/moon: each icon spins in from outside the visible disc while the other spins out */}
      <Sun
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 text-amber-500 transition-all duration-300 ease-out ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden
      />
      <Moon
        size={16}
        strokeWidth={2}
        className={`absolute h-4 w-4 text-violet-300 transition-all duration-300 ease-out ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden
      />
    </button>
  );
}

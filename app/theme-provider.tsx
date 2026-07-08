"use client";

import * as React from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "growthads-theme";

function readPersisted(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
    return null;
  } catch {
    return null;
  }
}

function writePersisted(t: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* noop */
  }
}

function systemPreference(): Theme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function applyClass(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // During SSR and the first client render, we don't yet know the user's
  // true theme (the FlashThemeScript in <head> has set the class but React
  // hasn't read it). We expose a `mounted` flag so consumers can render a
  // neutral placeholder until hydration completes — preventing the
  // sun/moon flicker (and any icon-related hydration warnings).
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  // Sync state from <html> class on mount (post-hydration).
  React.useEffect(() => {
    const persisted = readPersisted();
    const fromHtml = document.documentElement.classList.contains("dark");
    const initial: Theme = persisted ?? (fromHtml ? "dark" : "light");
    applyClass(initial);
    setThemeState(initial);
    setMounted(true);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    applyClass(t);
    writePersisted(t);
    setThemeState(t);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Listen for OS-level preference changes when no manual override exists.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (readPersisted() === null) {
        const next: Theme = e.matches ? "dark" : "light";
        applyClass(next);
        setThemeState(next);
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const value = React.useMemo(
    () => ({ theme, mounted, toggleTheme, setTheme }),
    [theme, mounted, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const v = React.useContext(ThemeContext);
  if (!v) {
    // Rendered outside ThemeProvider — return a safe default (light + no-op).
    return {
      theme: "light",
      mounted: false,
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  return v;
}

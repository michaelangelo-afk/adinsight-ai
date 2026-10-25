"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { isWorkspacePath, WORKSPACE_THEME, type Theme } from "@/lib/theme";

export type { Theme };

export type ThemeContextValue = {
  /** The theme actually in effect (workspace routes are always dark). */
  theme: Theme;
  /** The visitor's saved preference — what the landing page uses. */
  preference: Theme;
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
  // `preference` is the visitor's saved choice for the marketing shell. The
  // workspace ignores it — see lib/theme.ts.
  const [preference, setPreference] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const inWorkspace = isWorkspacePath(pathname);
  const theme: Theme = inWorkspace ? WORKSPACE_THEME : preference;

  // Sync from <html> class / storage on mount (post-hydration).
  React.useEffect(() => {
    const fromHtml = document.documentElement.classList.contains("dark");
    setPreference(readPersisted() ?? (fromHtml ? "dark" : systemPreference()));
    setMounted(true);
  }, []);

  // Keep the document class in sync with the route + preference.
  React.useEffect(() => {
    applyClass(theme);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    writePersisted(t);
    setPreference(t);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setPreference((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      writePersisted(next);
      return next;
    });
  }, []);

  // Listen for OS-level preference changes when no manual override exists.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (readPersisted() === null) {
        setPreference(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const value = React.useMemo(
    () => ({ theme, preference, mounted, toggleTheme, setTheme }),
    [theme, preference, mounted, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const v = React.useContext(ThemeContext);
  if (!v) {
    // Rendered outside ThemeProvider — return a safe default.
    return {
      theme: "light",
      preference: "light",
      mounted: false,
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }
  return v;
}

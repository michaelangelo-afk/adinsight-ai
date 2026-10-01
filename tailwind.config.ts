import type { Config } from "tailwindcss";

/**
 * GrowthAds design system.
 *
 * Rebuilt 2026-10-01 after measuring the rendered CSS (see tools/audit_ui.mjs).
 * The rules this file enforces, and why:
 *
 * 1. ONE green ramp, named `brand`, with EVERY step declared explicitly.
 *    The previous config set `theme.extend.violet` = green, which MERGES with
 *    Tailwind's default *purple* violet for any step it didn't declare.
 *    Result: 39 usages rendered purple in a green product (violet-50/100/200)
 *    and `naira-100/200` rendered nothing at all. Every step is now explicit,
 *    so no default can bleed through.
 *
 * 2. `naira` is gone. It was a second green ramp (emerald) sitting alongside
 *    a green ramp named `violet`. Sixteen tokens for one colour family.
 *
 * 3. ONE shadow token. There were eight, with inconsistent elevation.
 *
 * 4. ZERO custom keyframes. There were 24. Madgicx, the reference, has none —
 *    its whole motion personality is `transition: 0.2s ease`, which now lives
 *    as a single base rule in app/globals.css. Motion should be felt, not seen.
 *
 * What is deliberately NOT in this file:
 *   - border radii are handled by migrating component classes to
 *     `rounded-2xl` (16px) + `rounded-full`, so only two steps are used;
 *   - type sizes are handled the same way, down to six steps.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        /**
         * THE brand green. Every step declared — 50..950 — so nothing
         * falls back to a Tailwind default. Forest → emerald.
         */
        brand: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          950: "#052E16"
        },
        /** Dark dashboard surfaces. */
        ink: {
          950: "#070710",
          900: "#0b0b18",
          850: "#10102a",
          800: "#15162e",
          700: "#1d1e3a",
          600: "#272a4d",
          500: "#3a3d62"
        },
        /** Neutral text + borders (slate). */
        mist: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569"
        },
        /** Light page surfaces. */
        surface: {
          50: "#FFFFFF",
          100: "#FAFBF7",
          200: "#F1F4EC",
          300: "#E2E8F0",
          400: "#CBD5E1"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #15803D 0%, #16A34A 45%, #22C55E 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(21, 128, 61, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)"
      },
      /** One shadow. Elevation was previously eight competing tokens. */
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.05), 0 12px 32px -12px rgba(15, 23, 42, 0.12)"
      }
      // NOTE: no `keyframes` and no `animation`. Deliberate — see header.
    }
  },
  plugins: []
};

export default config;

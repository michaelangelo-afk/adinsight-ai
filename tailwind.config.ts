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
      /**
       * Elevation + emphasis. Three NAMED tokens, not eight.
       *
       * Before: `shadow-card` plus ~20 hand-written glow values spread across
       * components (`shadow-[0_0_40px_-5px_rgba(34,197,94,0.55)]`,
       * `shadow-[0_0_30px_-4px_rgba(16,185,129,0.6)]`, `drop-shadow(0 14px 30px …)`, …).
       * Every one of those magic numbers is actually one of two ideas — a resting
       * card, or a green emphasis bloom — so they collapse into `card` and `glow`.
       * `lift` is the hover elevation, previously expressed as a `filter:
       * drop-shadow()`, which forced a new paint layer instead of reusing the
       * shadow the element already had.
       *
       * Rule: nothing may write an arbitrary `shadow-[…]` any more. Pick a token.
       */
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.05), 0 12px 32px -12px rgba(15, 23, 42, 0.12)",
        lift: "0 2px 4px rgba(15, 23, 42, 0.06), 0 22px 44px -18px rgba(15, 23, 42, 0.22)",
        glow: "0 0 32px -6px rgba(16, 185, 129, 0.45)"
      },
      /**
       * Semantic spacing rhythm.
       *
       * The numeric scale stays (Tailwind's 4px base is already a rhythm), but the
       * measurements that repeat hundreds of times get a NAME so they can't drift:
       * card padding, the page gutter, section rhythm and table-row height. Before
       * this, card interiors were `p-3`, `p-4`, `p-5 sm:p-6`, `p-6` and `p-7`
       * depending on which component you opened — same intent, five values.
       *
       * Everything is a multiple of 2px so nested paddings and gaps line up on a
       * shared grid at every breakpoint.
       */
      spacing: {
        gutter: "1.5rem", // 24px — horizontal page gutter (mobile)
        "gutter-lg": "2rem", // 32px — gutter at md+
        card: "1.25rem", // 20px — card interior (mobile)
        "card-lg": "1.5rem", // 24px — card interior at sm+
        row: "0.875rem", // 14px — list/table row padding-y
        section: "6rem", // 96px — vertical section rhythm
        "section-lg": "8rem" // 128px — section rhythm at md+
      },
      /**
       * Line-height + tracking for the sanctioned type ramp only
       * (12 / 14 / 16 / 20 / 32 / 48 / 60). Any size not in this ramp is a bug:
       * it means someone used `text-lg` (18px) or `text-4xl` (36px) and drifted off
       * the system. `tools/audit_ui.mjs` counts distinct rendered sizes, so drift is
       * measurable rather than a matter of opinion.
       */
      fontSize: {
        xs: ["12px", { lineHeight: "1.1rem" }],
        sm: ["14px", { lineHeight: "1.35rem" }],
        base: ["16px", { lineHeight: "1.6rem" }],
        xl: ["20px", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "3xl": ["32px", { lineHeight: "2.375rem", letterSpacing: "-0.022em" }],
        "5xl": ["48px", { lineHeight: "3.25rem", letterSpacing: "-0.028em" }],
        "6xl": ["60px", { lineHeight: "3.75rem", letterSpacing: "-0.032em" }]
      },
      letterSpacing: {
        eyebrow: "0.16em" // uppercase micro-labels only
      },
      /** Minimum comfortable hit area for anything interactive (WCAG 2.5.5). */
      minHeight: {
        control: "44px"
      },
      minWidth: {
        control: "44px"
      },
      maxWidth: {
        content: "80rem" // 1280px — one content rail for nav, sections, footer
      }
      // NOTE: no `keyframes` and no `animation`. Deliberate — see header.
    }
  },
  plugins: []
};

export default config;

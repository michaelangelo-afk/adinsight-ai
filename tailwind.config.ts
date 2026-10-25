import type { Config } from "tailwindcss";

/**
 * GrowthAds design system — dark operator surface (2026-10-24).
 *
 * Modelled on the MarketMind-style reference: a deep navy stock, a single
 * luminous accent, flat panels separated by 1px hairlines, and typography
 * that steps down cleanly (26px figures, 13px titles, 11px labels).
 *
 * Three rules encode the look:
 *   1. One accent. Emerald is the only colour that carries meaning; every
 *      other surface step is neutral navy. Multi-colour is reserved for
 *      chart series, where position already differentiates.
 *   2. Flat over glassy. Panels are a solid colour + a 7%-white border. No
 *      blurred glows, no drop shadows on cards, no gradient washes.
 *   3. Tight radii. 8px controls, 12px panels, pill only for status chips.
 *
 * Radii are deliberately remapped (2xl → 12px) so the hundreds of existing
 * `rounded-2xl` call sites tighten with the system instead of each needing
 * an edit.
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
        /** Navy surface stack. 950 page, 900 panel, 850 raised, 800 nested. */
        ink: {
          950: "#060911",
          900: "#0A0F19",
          850: "#0D131F",
          800: "#111827",
          700: "#1A2333",
          600: "#253248",
          500: "#33425A"
        },
        /** App panel surfaces as first-class tokens. */
        app: {
          bg: "#060911",
          panel: "#0A0F19",
          raised: "#0D131F",
          inset: "#070C15",
          line: "rgba(255,255,255,0.07)"
        },
        /** Chart series — meaning, not decoration. */
        chart: {
          green: "#34D399",
          blue: "#60A5FA",
          violet: "#A78BFA",
          amber: "#FBBF24",
          rose: "#FB7185"
        },
        /** Emerald accent ramp — the one colour that glows. */
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22"
        },
        /** Light surfaces for the signed-in app + auth column. */
        surface: {
          50: "#FFFFFF",
          100: "#F7F9F8",
          200: "#EDF1EF",
          300: "#E2E8F0",
          400: "#CBD5E1"
        },
        /**
         * Text scale. On the app's navy stock, mist-50 is the primary figure,
         * 300 is body, 400 label, 500 caption. The light-surface usages keep
         * working because the app is dark-only (see lib/theme.ts).
         */
        mist: {
          50: "#F3F6FB",
          100: "#E7ECF5",
          200: "#CBD4E3",
          300: "#A4B0C4",
          400: "#7F8CA3",
          500: "#5F6C82",
          600: "#46536A"
        },
        /** Kept as aliases so earlier components stay valid. */
        paper: {
          50: "#FFFFFF",
          100: "#F7F9F8",
          200: "#EDF1EF",
          300: "#E2E8F0"
        },
        /**
         * Theme-aware landing shell. `shell` is the foreground ink (white on
         * dark, near-black on light), `shellbg` the page stock, `accent` the
         * emerald that stays legible on both. Driven by CSS vars set in
         * globals.css on `.shell`, so every alpha utility flips with the theme.
         */
        shell: "rgb(var(--shell-fg) / <alpha-value>)",
        shellbg: "rgb(var(--shell-bg) / <alpha-value>)",
        accent: "rgb(var(--shell-accent) / <alpha-value>)",
        /** Red pen is gone; destructive stays for the app. */
        ledger: {
          300: "#FCA5A5",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"]
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #047857 0%, #10B981 60%, #34D399 100%)",
        /** One soft top wash for page headers — used once per page, never per card. */
        "page-glow": "radial-gradient(70% 60% at 30% 0%, rgba(16,185,129,0.10) 0%, rgba(6,9,17,0) 68%)",
        /** Headline fill used by the reference: white into 72% white. */
        "headline-fade": "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.72) 100%)",
        /** Top-light wash for glass cards. */
        "card-sheen": "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 48%, rgba(255,255,255,0) 100%)",
        "hero-glow": "radial-gradient(60% 55% at 50% 0%, rgba(16,185,129,0.22) 0%, rgba(5,7,11,0) 70%)"
      },
      boxShadow: {
        /** Flat panels: a single hairline of inset light, nothing more. */
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px rgba(0,0,0,0.8)",
        lift: "0 1px 0 rgba(255,255,255,0.06) inset, 0 32px 80px -28px rgba(0,0,0,0.9)",
        glow: "0 0 120px -24px rgba(16,185,129,0.45)",
        "cta-ring": "0 0 0 3px rgba(255,255,255,0.18)",
        plate: "0 40px 120px -40px rgba(0,0,0,0.9)"
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "16px",
        pill: "9999px",
        full: "9999px"
      },
      spacing: {
        gutter: "1.25rem",
        "gutter-lg": "2.5rem",
        card: "1.25rem",
        "card-lg": "1.75rem",
        row: "0.875rem",
        section: "5rem",
        "section-lg": "9rem"
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.05rem" }],
        sm: ["14px", { lineHeight: "1.4rem" }],
        base: ["16px", { lineHeight: "1.6rem" }],
        xl: ["20px", { lineHeight: "1.6rem", letterSpacing: "-0.01em" }],
        "2xl": ["24px", { lineHeight: "1.75rem", letterSpacing: "-0.02em" }],
        "3xl": ["30px", { lineHeight: "2.125rem", letterSpacing: "-0.025em" }],
        "5xl": ["48px", { lineHeight: "3.1rem", letterSpacing: "-0.03em" }],
        "6xl": ["56px", { lineHeight: "3.5rem", letterSpacing: "-0.035em" }],
        "7xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.04em" }]
      },
      letterSpacing: {
        eyebrow: "0.02em"
      },
      minHeight: { control: "44px" },
      minWidth: { control: "44px" },
      maxWidth: {
        content: "80rem", // 1280 — matches the reference container
        prose: "42rem"
      }
    }
  },
  plugins: []
};

export default config;

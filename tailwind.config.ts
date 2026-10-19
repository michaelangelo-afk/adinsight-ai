import type { Config } from "tailwindcss";

/**
 * GrowthAds design system — Madgicx-aligned (2026-10-19).
 *
 * The reference, measured with tools/reference_audit.mjs + design_probe.mjs:
 *   - near-black page (#040114 there), white text at 56% / 72% opacity
 *   - one accent (violet #CAB7FF) used for glow and gradients, never as a
 *     large fill behind body copy
 *   - Inter body at 14px, near-identical grayscale steps, weight 400–600
 *   - 64px centred headline, white → 72% white gradient fill
 *   - pills (radius 60 / 1000) for CTAs, 8/16/32px radii for panels
 *   - product screenshots at 32px radius, 1262px wide, on a soft glow
 *
 * GrowthAds keeps its own accent (emerald instead of violet) but adopts that
 * structure exactly: dark page, white/72 body copy, white pill primary CTA,
 * dark glass pill secondary, rounded panels, product-first layout.
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
        /** Near-black surfaces. 950 is the page, 900 cards, 800 raised. */
        ink: {
          950: "#05070B",
          900: "#0A0D14",
          850: "#0F1320",
          800: "#151A29",
          700: "#1E2436",
          600: "#2A3145",
          500: "#3A4356"
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
        /** Light-mode text/borders. */
        mist: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569"
        },
        /** Kept as aliases so earlier components stay valid. */
        paper: {
          50: "#FFFFFF",
          100: "#F7F9F8",
          200: "#EDF1EF",
          300: "#E2E8F0"
        },
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
        "brand-gradient": "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
        /** Headline fill used by the reference: white into 72% white. */
        "headline-fade": "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.72) 100%)",
        /** Top-light wash for glass cards. */
        "card-sheen": "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 48%, rgba(255,255,255,0) 100%)",
        "hero-glow": "radial-gradient(60% 55% at 50% 0%, rgba(16,185,129,0.22) 0%, rgba(5,7,11,0) 70%)"
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px rgba(0,0,0,0.8)",
        lift: "0 1px 0 rgba(255,255,255,0.06) inset, 0 32px 80px -28px rgba(0,0,0,0.9)",
        glow: "0 0 120px -24px rgba(16,185,129,0.45)",
        "cta-ring": "0 0 0 3px rgba(255,255,255,0.18)",
        plate: "0 40px 120px -40px rgba(0,0,0,0.9)"
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "16px",
        "2xl": "16px",
        "3xl": "24px",
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
        "3xl": ["32px", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
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

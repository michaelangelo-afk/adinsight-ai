import type { Config } from "tailwindcss";

/**
 * GrowthAds design system — "The Monday Statement" (rebuilt 2026-10-13).
 *
 * The product's promise is financial: know which naira grew. The interface is
 * therefore built like a printed statement rather than a SaaS template — paper
 * ground, ink rules, ledger figures, one signal red. Three rules keep it from
 * drifting back into generics:
 *
 * 1. SURFACES ARE PAPER, NOT WHITE. `paper` / `surface` are warm stocks; `ink`
 *    is a green-black. There is no pure #FFFFFF page, and no glass blur on the
 *    marketing surface.
 *
 * 2. GEOMETRY IS SQUARE. Radii are 0 / 2px / full (dot only). No 16px card
 *    corners, no floating card shadows. Structure is drawn with 1px rules.
 *
 * 3. THREE FACES, THREE JOBS. Fraunces (display, editorial serif) for
 *    headlines; Instrument Sans for interface copy; JetBrains Mono for every
 *    figure, label and section number. Never mix the jobs.
 *
 * Every colour step is declared explicitly so no Tailwind default can bleed
 * through (the violet-named-green incident of 2026-10-01).
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
        /** Bottle green. Text-safe from 600 down, surfaces from 50–200. */
        brand: {
          50: "#EEF4EC",
          100: "#D9E7D4",
          200: "#B6D0AE",
          300: "#8CB684",
          400: "#5F9A62",
          500: "#3F7D48",
          600: "#2F6539",
          700: "#23502E",
          800: "#1B4025",
          900: "#15331E",
          950: "#0A2114"
        },
        /** Warm paper stock (light surfaces) and green-black ink (dark). */
        paper: {
          50: "#F8F4EA",
          100: "#F1ECDF",
          200: "#E7E0CF",
          300: "#D8CFB9"
        },
        ink: {
          950: "#0B0F0C",
          900: "#101612",
          850: "#161E18",
          800: "#1D2620",
          700: "#2A352D",
          600: "#3C4A40",
          500: "#55655A"
        },
        /** Warm neutral text + hairline borders. */
        mist: {
          50: "#F7F4EC",
          100: "#EFEADD",
          200: "#DED7C6",
          300: "#C4BBA7",
          400: "#9F9581",
          /** Darkened 2026-10-19: #7A7260 measured 4.04:1 on paper-100 and
           *  3.7:1 on surface-100, under AA for the 12px mono labels it carries. */
          500: "#69614F",
          600: "#57513F"
        },
        /** Page surfaces — aliases kept so existing components stay valid. */
        surface: {
          50: "#F1ECDF",
          100: "#E9E2D2",
          200: "#E1D8C5",
          300: "#D8CFB9",
          400: "#C4BBA7"
        },
        /** Editorial red: negative deltas, annotations, the accountant's pen. */
        ledger: {
          300: "#E8A7A1",
          500: "#B3261E",
          600: "#96201A",
          700: "#7A1A15"
        }
      },
      fontFamily: {
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"]
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #1B4025 0%, #23502E 55%, #2F6539 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(35, 80, 46, 0.07) 0%, rgba(63, 125, 72, 0.05) 100%)"
      },
      /**
       * Elevation is drawn, not floated: one hairline, one offset. Anything
       * heavier reads as a template card and breaks the printed-page idea.
       */
      boxShadow: {
        card: "0 1px 0 rgba(11, 15, 12, 0.10)",
        lift: "0 2px 0 rgba(11, 15, 12, 0.14)",
        glow: "0 0 0 4px rgba(63, 125, 72, 0.16)",
        /** Offset plate: the printed-sheet shadow used on statement blocks. */
        plate: "8px 8px 0 0 rgba(11, 15, 12, 0.07)",
        "plate-dark": "8px 8px 0 0 rgba(239, 234, 221, 0.08)"
      },
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px"
      },
      spacing: {
        gutter: "1.5rem",
        "gutter-lg": "2rem",
        card: "1.25rem",
        "card-lg": "1.5rem",
        row: "0.875rem",
        section: "5.5rem",
        "section-lg": "8rem"
      },
      /**
       * One ramp, declared. Display steps are optical sizes for Fraunces; the
       * mono label sits at 12px. Nothing renders off this list.
       */
      fontSize: {
        xs: ["12px", { lineHeight: "1.05rem" }],
        sm: ["14px", { lineHeight: "1.4rem" }],
        base: ["16px", { lineHeight: "1.65rem" }],
        xl: ["20px", { lineHeight: "1.75rem", letterSpacing: "-0.005em" }],
        "3xl": ["34px", { lineHeight: "2.35rem", letterSpacing: "-0.02em" }],
        "5xl": ["46px", { lineHeight: "2.95rem", letterSpacing: "-0.025em" }],
        "6xl": ["64px", { lineHeight: "3.85rem", letterSpacing: "-0.03em" }],
        "7xl": ["92px", { lineHeight: "5rem", letterSpacing: "-0.04em" }]
      },
      letterSpacing: {
        eyebrow: "0.18em"
      },
      minHeight: {
        control: "44px"
      },
      minWidth: {
        control: "44px"
      },
      maxWidth: {
        content: "80rem"
      }
    }
  },
  plugins: []
};

export default config;

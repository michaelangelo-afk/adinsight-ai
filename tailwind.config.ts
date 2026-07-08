import type { Config } from "tailwindcss";

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
        ink: {
          950: "#070710",
          900: "#0b0b18",
          850: "#10102a",
          800: "#15162e",
          700: "#1d1e3a",
          600: "#272a4d",
          500: "#3a3d62"
        },
        violet: {
          950: "#052E16",
          900: "#14532D",
          800: "#166534",
          700: "#15803D",
          600: "#16A34A",
          500: "#22C55E",
          400: "#4ADE80",
          300: "#86EFAC"
        },
        naira: {
          950: "#022C22",
          900: "#064E3B",
          800: "#065F46",
          700: "#047857",
          600: "#059669",
          500: "#10B981",
          400: "#34D399",
          300: "#6EE7B7"
        },
        mist: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569"
        },
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
          "linear-gradient(135deg, #15803D 0%, #16A34A 45%, #10B981 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(21, 128, 61, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)",
        "subtle-grid":
          "linear-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px)",
        "subtle-grid-dark":
          "linear-gradient(rgba(16, 185, 129, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.10) 1px, transparent 1px)",
        "mesh-gradient-light":
          "radial-gradient(at 20% 20%, rgba(34, 197, 94, 0.30) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(22, 163, 74, 0.20) 0px, transparent 50%), radial-gradient(at 60% 90%, rgba(16, 185, 129, 0.18) 0px, transparent 50%)",
        "mesh-gradient-dark":
          "radial-gradient(at 20% 20%, rgba(34, 197, 94, 0.20) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(22, 163, 74, 0.14) 0px, transparent 50%), radial-gradient(at 60% 90%, rgba(16, 185, 129, 0.12) 0px, transparent 50%)",
        "glow-emerald":
          "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.20), transparent 60%)",
        "glow-forest":
          "radial-gradient(circle at 50% 100%, rgba(21, 128, 61, 0.16), transparent 60%)"
      },
      boxShadow: {
        "glow-emerald": "0 0 60px -10px rgba(16, 185, 129, 0.45)",
        "glow-emerald-dark":
          "0 0 60px -10px rgba(16, 185, 129, 0.35), 0 0 0 1px rgba(34, 197, 94, 0.20) inset",
        "glow-forest":
          "0 12px 32px -8px rgba(21, 128, 61, 0.30), 0 1px 0 0 rgba(255,255,255,1) inset",
        "card-elevated":
          "0 1px 0 0 rgba(255,255,255,1) inset, 0 20px 60px -20px rgba(15, 23, 42, 0.10)",
        "card-elevated-dark":
          "0 1px 0 0 rgba(34, 197, 94, 0.06) inset, 0 20px 60px -20px rgba(0, 0, 0, 0.45)",
        "card-flat":
          "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
        "card-flat-dark":
          "0 1px 2px rgba(0, 0, 0, 0.45), 0 4px 12px -2px rgba(0, 0, 0, 0.55)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        sprout: {
          "0%": { transform: "scale(0.94)", opacity: "0.6" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "dash-flow": {
          to: { strokeDashoffset: "-24" }
        },
        "aurora-border": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(-1deg)" }
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" }
        },
        "mesh-shift": {
          "0%, 100%": { backgroundPosition: "20% 20%, 80% 10%, 60% 90%" },
          "50%": { backgroundPosition: "60% 30%, 30% 60%, 80% 70%" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 3.5s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        sprout: "sprout 1.6s ease-out both",
        marquee: "marquee 35s linear infinite",
        "dash-flow": "dash-flow 1.2s linear infinite",
        "aurora-border": "aurora-border 6s ease infinite",
        float: "float 6s ease-in-out infinite",
        "scale-pulse": "scale-pulse 3s ease-in-out infinite",
        "mesh-shift": "mesh-shift 18s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
export default config;

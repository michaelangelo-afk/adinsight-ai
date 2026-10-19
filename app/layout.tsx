import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/theme-provider";
import { FlashThemeScript } from "@/app/flash-theme";

/** Editorial serif — headlines only. */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap"
});

/** Interface face. Narrow, quiet, nothing like Inter at display sizes. */
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap"
});

/** Every figure, label and section number. Tabular by nature. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: "GrowthAds — Plant money on ads that grow",
  description:
    "The all-in-one growth platform for Nigerian SMEs running ads on Meta, Google, and TikTok. Multi-platform analytics, rule-based automations, and true cross-platform deployment — all from one dashboard.",
  metadataBase: new URL("https://growthads.ng"),
  openGraph: {
    title: "GrowthAds — Plant money on ads that grow",
    description:
      "Multi-platform analytics, automated budget rules, and cross-platform deployment for Nigerian SMEs.",
    type: "website"
  }
};

export const viewport: Viewport = {
  // Default theme-color is the light surface; the FlashThemeScript in <head>
  // can replace it on dark-mode landing via meta swap if we ever want to.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1ECDF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F0C" }
  ],
  colorScheme: "normal"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${jetbrains.variable}`}
      // The dark class is set imperatively by the inline script in <head>.
      // suppressHydrationWarning prevents React's noisy diff for that one
      // controlled mutation.
      suppressHydrationWarning
    >
      <head>
        <FlashThemeScript />
      </head>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

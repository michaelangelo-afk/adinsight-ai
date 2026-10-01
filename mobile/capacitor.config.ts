import type { CapacitorConfig } from "@capacitor/cli";

/**
 * GrowthAds native shell (same Capacitor stack as Torano / RapidEX).
 *
 * Difference vs Torano: GrowthAds is a dynamic Next.js app (middleware,
 * SSR routes, API handlers) so it cannot `output: "export"` into `out/`
 * like torano-mobile does. Instead the shell loads the live HTTPS bundle
 * from Vercel — every web deploy automatically updates the app.
 *
 * `webDir` still needs a real folder for `cap sync`; `cap-www/` holds a
 * minimal offline fallback that only shows if the remote is unreachable
 * before the server.url override kicks in.
 */
const config: CapacitorConfig = {
  appId: "com.growthads.app",
  appName: "GrowthAds",
  webDir: "cap-www",
  server: {
    androidScheme: "https",
    url: "https://adinsight-ai-six.vercel.app",
    cleartext: false
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: "LIGHT",
      backgroundColor: "#15803D"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#15803D",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;

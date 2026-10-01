// Renders mobile/assets/icon.png (1024x1024) and mobile/assets/splash.png
// (2732x2732) from the GrowthAds leaf mark, using the locally installed
// Playwright Chromium. Run:  node tools/gen-mobile-icons.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "mobile", "assets");
mkdirSync(outDir, { recursive: true });

const leaf = (size) => `
  <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stop-color="#4ADE80"/>
        <stop offset="55%" stop-color="#22C55E"/>
        <stop offset="100%" stop-color="#15803D"/>
      </linearGradient>
    </defs>
    <path d="M18 4 C 27 8, 31 14, 31 22 C 31 28, 26 32, 18 32 C 10 32, 5 28, 5 22 C 5 14, 9 8, 18 4 Z" fill="url(#g)"/>
    <path d="M18 9 L 18 30" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M14 22 L 18 18 L 22 22 M 14 27 L 18 23 L 22 27" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

const page = (title, size, inner) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;}
  .canvas{width:${size}px;height:${size}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(size * 0.03)}px;
    background:linear-gradient(160deg,#052E16 0%,#0A1E1A 55%,#070C1A 100%);}
  h1{margin:0;font-family:system-ui,-apple-system,sans-serif;font-weight:800;letter-spacing:-0.03em;color:#ECFDF5;font-size:${Math.round(size * 0.055)}px;}
  h1 span{color:#4ADE80;}
</style></head><body><div class="canvas">${inner}</div></body></html>`;

const browser = await chromium.launch();
const page_ = await browser.newPage({ viewport: { width: 2732, height: 2732 } });

// icon.png — mark only, centered (safe-zone friendly for @capacitor/assets)
await page_.setContent(page("icon", 1024, leaf(560)), { waitUntil: "networkidle" });
await page_.screenshot({ path: join(outDir, "icon.png"), clip: { x: 854, y: 854, width: 1024, height: 1024 } });

// splash.png — mark + wordmark on the brand gradient
await page_.setContent(
  page("splash", 2732, `${leaf(620)}<h1>Growth<span>Ads</span></h1>`),
  { waitUntil: "networkidle" }
);
await page_.screenshot({ path: join(outDir, "splash.png") });

await browser.close();
console.log("wrote", join(outDir, "icon.png"), "and", join(outDir, "splash.png"));

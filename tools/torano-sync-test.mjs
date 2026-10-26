// Functional sync test: does the deployed web behave like the APK?
// Drives torano-mu.vercel.app in headless Chromium at a phone viewport and
// reports per-route render results, Supabase data presence, and console errors.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "https://torano-mu.vercel.app";
const routes = [
  "/",
  "/products/",
  "/cart/",
  "/login/",
  "/signup/",
  "/account/",
  "/orders/",
  "/checkout/",
  "/admin/",
  "/seller/",
  "/pay-small-small/",
  "/sell-on-torano/"
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36"
});
const page = await ctx.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
});
page.on("requestfailed", (r) =>
  failedRequests.push(`${r.method()} ${r.url().slice(0, 90)} :: ${r.failure()?.errorText}`)
);
page.on("response", (r) => {
  if (r.status() >= 400 && !r.url().includes("favicon"))
    failedRequests.push(`${r.status()} ${r.url().slice(0, 90)}`);
});

const rows = [];
for (const route of routes) {
  const entry = { route, status: "-", h1: "", textLen: 0, naira: 0, errors: 0 };
  try {
    const resp = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    entry.status = resp ? resp.status() : "netfail";
    await page.waitForTimeout(1200); // let client hydration + supabase fetches land
    entry.h1 = (await page.locator("h1").first().textContent().catch(() => ""))?.trim().slice(0, 48) || "";
    const body = await page.locator("body").innerText().catch(() => "");
    entry.textLen = body.length;
    entry.naira = (body.match(/₦/g) || []).length;
    entry.errors = consoleErrors.length;
  } catch (e) {
    entry.status = "ERR";
    entry.h1 = String(e).slice(0, 60);
  }
  rows.push(entry);
  console.log(
    `${String(entry.status).padEnd(6)} ${route.padEnd(20)} h1="${entry.h1}" text=${String(entry.textLen).padStart(6)} naira=${String(entry.naira).padStart(3)} errs=${entry.errors}`
  );
}

console.log("\n== console errors ==");
console.log(consoleErrors.slice(0, 8).join("\n") || "none");
console.log("\n== failed/4xx+ requests ==");
console.log(failedRequests.slice(0, 10).join("\n") || "none");

// screenshots of the money pages for eyeballing
for (const [name, route] of [["home", "/"], ["products", "/products/"], ["cart", "/cart/"]]) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/torano-web-${name}.png`, fullPage: false }).catch(() => {});
}

await browser.close();

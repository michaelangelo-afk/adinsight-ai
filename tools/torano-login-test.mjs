// End-to-end check of the two reported failures on the LIVE site:
//   1. email/password login (admin creds)
//   2. admin dashboard access after login
//   3. Google button present (AUTH_GOOGLE flag baked in)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "https://torano-mu.vercel.app";
const EMAIL = "admin@torano.app";
const PASSWORD = readFileSync("/root/.secrets/torano-admin-password", "utf8").trim();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errs = [];
page.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 140)));

// -- Google button present on login? --
await page.goto(BASE + "/login/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1000);
const googleBtn = await page.getByRole("button", { name: /google/i }).count();
console.log("google button visible:", googleBtn > 0);

// -- email/password login --
await page.locator('input[type="email"], input[name="email"]').first().fill(EMAIL);
await page.locator('input[type="password"], input[name="password"]').first().fill(PASSWORD);
await page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first().click();
await page.waitForTimeout(5000);
const afterLoginH1 = (await page.locator("h1").first().textContent().catch(() => "?"))?.trim();
const afterLoginUrl = page.url();
console.log("after login:", JSON.stringify({ url: afterLoginUrl, h1: afterLoginH1 }));
await page.screenshot({ path: "/tmp/torano-after-login.png" });

// -- admin dashboard --
await page.goto(BASE + "/admin/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(4000);
const adminH1 = (await page.locator("h1").first().textContent().catch(() => "?"))?.trim();
const adminBody = (await page.locator("body").innerText().catch(() => "")).slice(0, 200).replace(/\n+/g, " | ");
console.log("admin page:", JSON.stringify({ h1: adminH1, body: adminBody }));
await page.screenshot({ path: "/tmp/torano-admin.png", fullPage: false });

console.log("console errors:", errs.length ? errs.slice(0, 5).join(" || ") : "none");
await browser.close();

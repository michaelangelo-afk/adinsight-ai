// OAuth handoff test: everything up to the Google consent screen.
// A real consent needs a human Google account; landing on accounts.google.com
// proves the app -> Supabase -> Google chain is correctly configured.
import { chromium } from "playwright";

const BASE = "https://torano-mu.vercel.app";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(BASE + "/login/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(800);

const btn = page.getByRole("button", { name: /google/i }).first();
console.log("google button found:", await btn.count());

await btn.click();
// signInWithOAuth redirects the whole page: supabase -> accounts.google.com
try {
  await page.waitForURL(/accounts\.google\.com/, { timeout: 20000 });
  console.log("LANDED ON GOOGLE:", page.url().slice(0, 90));
  const html = await page.content();
  const hasClientId = /[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com/.test(page.url() + html);
  console.log("oauth client id present:", hasClientId);
} catch {
  console.log("did NOT reach accounts.google.com — current URL:", page.url());
  const body = (await page.locator("body").innerText().catch(() => "")).slice(0, 300);
  console.log("page text:", body.replace(/\n+/g, " | "));
}
await page.screenshot({ path: "/tmp/torano-oauth.png" });
await browser.close();

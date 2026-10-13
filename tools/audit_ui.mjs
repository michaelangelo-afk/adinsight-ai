// tools/audit_ui.mjs
//
// Design-system audit for a rendered page. We cannot "look" at a
// screenshot, so instead we measure what the browser actually computed:
// how many distinct colours / font sizes / radii / weights are in play,
// whether text passes WCAG AA contrast, and whether anything overflows
// horizontally at mobile width.
//
// Usage:  node tools/audit_ui.mjs [url]
//
// The server must already be running (npm run start).

import { chromium } from "@playwright/test";

const url = process.argv[2] || "http://127.0.0.1:3000/";

function parseRgb(s) {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((x) => parseFloat(x.trim()));
  return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
}

function relLum({ r, g, b }) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(fg, bg) {
  const a = relLum(fg), b = relLum(bg);
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

// Walk up the tree to find the first non-transparent background.
const FIND_BG = `
  // Returns { bg, gradient }. We must know if a gradient is in the
  // ancestor chain — a solid background-color alone is not the real
  // backdrop for white-on-gradient text, so scoring it would produce
  // a false "invisible text" failure.
  function effectiveBg(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const img = cs.backgroundImage;
      if (img && img !== "none") return { bg: cs.backgroundColor, gradient: true };
      const bg = cs.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return { bg, gradient: false };
      n = n.parentElement;
    }
    return { bg: "rgb(255, 255, 255)", gradient: false };
  }
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const data = await page.evaluate(`(() => {
  ${FIND_BG}
  const colors = {}, bgs = {}, fonts = {}, sizes = {}, radii = {}, weights = {}, shadows = {};
  const texts = [];
  const bump = (o, k) => { if (k) o[k] = (o[k] || 0) + 1; };

  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    bump(bgs, cs.backgroundColor);
    bump(radii, cs.borderRadius);
    bump(shadows, cs.boxShadow === "none" ? null : cs.boxShadow.split(",")[0].trim());

    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1
    );
    if (!hasOwnText) continue;

    bump(colors, cs.color);
    bump(fonts, cs.fontFamily);
    bump(sizes, cs.fontSize);
    bump(weights, cs.fontWeight);
    texts.push({
      text: el.textContent.trim().replace(/\\s+/g, " ").slice(0, 44),
      tag: el.tagName.toLowerCase(),
      color: cs.color,
      background: effectiveBg(el).bg,
      onGradient: effectiveBg(el).gradient,
      size: parseFloat(cs.fontSize),
      weight: cs.fontWeight,
      family: cs.fontFamily.split(",")[0].replace(/["']/g, "")
    });
  }

  return {
    colors, bgs, fonts, sizes, radii, weights, shadows, texts,
    docHeight: document.documentElement.scrollHeight,
    docWidth: document.documentElement.scrollWidth,
    sections: [...document.querySelectorAll("section, header, footer, nav")].map((s) => ({
      tag: s.tagName.toLowerCase(),
      h: Math.round(s.getBoundingClientRect().height)
    }))
  };
})()`);

// ── mobile overflow check ────────────────────────────────────────────
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(url, { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
const overflow = await mobile.evaluate(`(() => {
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.right > window.innerWidth + 1 || r.left < -1) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right)
      });
    }
  }
  return { width: document.documentElement.scrollWidth, count: bad.length, sample: bad.slice(0, 10) };
})()`);

// ── report ───────────────────────────────────────────────────────────
const top = (o, n = 12) =>
  Object.entries(o)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `      ${String(v).padStart(4)}  ${k}`)
    .join("\n");

console.log(`\n=== DESIGN AUDIT: ${url} ===\n`);
console.log(`Document: ${data.docWidth} x ${data.docHeight}px\n`);

console.log(`DISTINCT TEXT COLOURS: ${Object.keys(data.colors).length}`);
console.log(top(data.colors));
console.log(`\nDISTINCT BACKGROUNDS: ${Object.keys(data.bgs).length}`);
console.log(top(data.bgs, 10));
console.log(`\nFONT FAMILIES: ${Object.keys(data.fonts).length}`);
console.log(top(data.fonts));
console.log(`\nTYPE SCALE: ${Object.keys(data.sizes).length} distinct sizes`);
console.log(top(data.sizes, 14));
console.log(`\nFONT WEIGHTS: ${Object.keys(data.weights).length}`);
console.log(top(data.weights, 8));
console.log(`\nBORDER RADII: ${Object.keys(data.radii).length}`);
console.log(top(data.radii, 10));
console.log(`\nSHADOWS: ${Object.keys(data.shadows).length}`);
console.log(top(data.shadows, 6));

// contrast
const fails = [];
for (const t of data.texts) {
  const fg = parseRgb(t.color);
  const bg = parseRgb(t.background);
  if (!fg || !bg) continue;
  const ratio = contrast(fg, bg);
  const large = t.size >= 24 || (t.size >= 18.66 && parseInt(t.weight, 10) >= 700);
  const threshold = large ? 3 : 4.5;
  if (ratio < threshold) {
    fails.push({ ...t, ratio: Math.round(ratio * 100) / 100, threshold });
  }
}
console.log(`\nCONTRAST FAILURES (WCAG AA): ${fails.length} of ${data.texts.length} text nodes`);
for (const f of fails.slice(0, 14)) {
  console.log(
    `   ${f.ratio} (needs ${f.threshold})  ${f.size}px/${f.weight}  "<${f.tag}> ${f.text}"`
  );
}

const sizeCounts = Object.entries(data.sizes).filter(([, v]) => v >= 3).length;
console.log(`\nMOBILE 390px: scrollWidth ${overflow.width} (viewport 390) — ${overflow.count} elements out of bounds`);
for (const o of overflow.sample) {
  console.log(`   ${o.tag}.${o.cls}  L${o.left} R${o.right}`);
}

console.log(`\nSECTION HEIGHTS`);
for (const s of data.sections) console.log(`   ${String(s.h).padStart(5)}px  <${s.tag}>`);

console.log(`\n=== VERDICT ===`);
const notes = [];
if (Object.keys(data.colors).length > 12) notes.push(`${Object.keys(data.colors).length} text colours — palette is not restrained`);
if (sizeCounts > 10) notes.push(`${sizeCounts} common type sizes (≥3 uses) — no clear type scale`);
if (Object.keys(data.weights).length > 4) notes.push(`${Object.keys(data.weights).length} font weights — too many`);
if (Object.keys(data.radii).length > 6) notes.push(`${Object.keys(data.radii).length} radii — inconsistent rounding`);
if (Object.keys(data.shadows).length > 5) notes.push(`${Object.keys(data.shadows).length} shadows — inconsistent elevation`);
if (fails.length > 0) notes.push(`${fails.length} contrast failures`);
if (overflow.count > 0) notes.push(`${overflow.count} mobile overflow issues`);
console.log(notes.length ? notes.map((n) => `   - ${n}`).join("\n") : "   - no structural issues detected");

await browser.close();

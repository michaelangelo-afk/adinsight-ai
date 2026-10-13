// tools/audit_modes.mjs
//
// Companion to tools/audit_ui.mjs. That tool measures ONE theme (light) and
// flags any element whose box crosses the viewport edge, which includes
// descendants of `overflow: hidden` containers — so the stats marquee, whose
// whole job is to extend past the edge and be clipped, shows up as ~60
// "overflow" items on a page that provably has no horizontal scroll.
//
// This tool answers the two questions audit_ui.mjs cannot:
//
//   1. Contrast in BOTH themes. The theme is a `dark` class on <html> driven by
//      `localStorage['growthads-theme']`, so we set that before the page loads
//      and measure again. audit_ui.mjs also composites nothing, so any text on a
//      translucent tint scored as if the tint were opaque — that is where its
//      "1.5:1" failures on chips came from. Here the ancestor background layers
//      are alpha-composited from the root down, which is what the eye sees.
//
//   2. Real horizontal overflow: only elements that stick out AND have no
//      `overflow-x: hidden|clip` ancestor. Anything clipped is by definition not
//      a horizontal-scroll defect.
//
// Usage:  node tools/audit_modes.mjs [url]

import { chromium } from "@playwright/test";

const url = process.argv[2] || "http://127.0.0.1:3000/";
const WIDTHS = [320, 375, 390, 414, 768, 1024, 1440];

const MEASURE = () => {
  const parse = (s) => {
    const m = (s || "").match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1
  });
  const lum = ({ r, g, b }) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  // Composite every background layer from <html> down to (and including) el.
  //
  // A gradient (background-image) anywhere in the chain makes the result
  // uncomputable from `background-color` alone: the shorthand resets
  // background-color to transparent and paints the gradient instead, so the walk
  // would fall through to the page base and report white-on-white for white text
  // sitting on a dark gradient panel. Rather than emit a fake failure, flag it.
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) layers.push(n);
    layers.reverse();
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    let gradient = false;
    for (const n of layers) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") gradient = true;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) acc = over(c, acc);
    }
    return { acc, gradient };
  };

  const out = [];
  const unmeasurable = [];
  const seen = new Set();
  for (const el of document.querySelectorAll(
    "p,span,a,li,h1,h2,h3,h4,h5,h6,button,label,td,th,div,strong,em,small"
  )) {
    const text = (el.textContent || "").trim();
    if (!text || el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0)
      continue;
    if (cs.webkitTextFillColor === "rgba(0, 0, 0, 0)" && cs.color === "rgba(0, 0, 0, 0)")
      continue; // fully transparent, painted by a background-clip
    const fg = parse(cs.color);
    if (!fg) continue;
    const { acc: bg, gradient } = bgOf(el);
    if (gradient) {
      unmeasurable.push(`${text.slice(0, 40)}`);
      continue;
    }
    const r = ratio(over(fg, bg), bg);
    const px = parseFloat(cs.fontSize);
    const bold = +cs.fontWeight >= 700;
    const need = px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
    if (r + 0.02 < need) {
      const key = `${cs.color}|${el.textContent.slice(0, 24)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        t: text.slice(0, 46),
        color: cs.color,
        size: `${px}px/${cs.fontWeight}`,
        ratio: +r.toFixed(2),
        need
      });
    }
  }
  return { failures: out, unmeasurable };
};

const OVERFLOW = () =>
  (() => {
    const de = document.documentElement;
    const clipped = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (o.overflowX === "hidden" || o.overflowX === "clip") return true;
      }
      return false;
    };
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.right > de.clientWidth + 1 && !clipped(el)) {
        bad.push(
          `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 40)} R=${Math.round(b.right)}`
        );
      }
    }
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, bad: bad.slice(0, 5), total: bad.length };
  })();

const browser = await chromium.launch();

console.log(`\n=== THEME + OVERFLOW AUDIT: ${url} ===`);
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("growthads-theme", t);
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const applied = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );
  const { failures: fails, unmeasurable } = await page.evaluate(MEASURE);
  console.log(
    `\n[${theme}] dark-class-applied=${applied}  contrast failures: ${fails.length}` +
      `  (gradient-backed, not measurable: ${unmeasurable.length})`
  );
  for (const f of fails) {
    console.log(
      `   ${String(f.ratio).padStart(5)} (needs ${f.need})  ${f.size.padEnd(9)} ${f.color.padEnd(22)} "${f.t}"`
    );
  }
  await ctx.close();
}

const ctx = await browser.newContext();
const page = await ctx.newPage();
console.log("\n=== HORIZONTAL OVERFLOW (unclipped only) ===");
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(url, { waitUntil: "networkidle" });
  const r = await page.evaluate(OVERFLOW);
  const h = r.scrollW > r.clientW;
  console.log(
    `${String(w).padStart(4)}px  scrollW=${r.scrollW} clientW=${r.clientW}  h-scroll=${h ? "YES ***" : "no"}  unclipped-overflow=${r.total}`
  );
  r.bad.forEach((x) => console.log(`        ${x}`));
}
await browser.close();

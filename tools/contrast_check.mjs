// tools/contrast_check.mjs
//
// audit_modes.mjs skips any element whose backdrop chain includes a
// background-image, which on the paper surface is *every* element (the body
// carries a ruled-paper gradient). That is honest about not knowing the painted
// colour, but it leaves most text unmeasured.
//
// This checker resolves the nearest ANCESTOR with an opaque background-color,
// ignoring background-image (the register lines are 3.5% ink over paper, close
// enough to the stock to measure), then computes WCAG contrast for every visible
// text node. It is deliberately conservative: text under 3:1 is a failure for
// large text, 4.5:1 for everything else, and it reports the worst offenders.
//
// Usage: node tools/contrast_check.mjs <url> [dark]

import { chromium } from "playwright";

const url = process.argv[2];
const dark = process.argv[3] === "dark";
if (!url) {
  console.error("usage: node tools/contrast_check.mjs <url> [dark]");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

if (dark) {
  await page.addInitScript(() => {
    localStorage.setItem("growthads-theme", "dark");
  });
}

await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const rows = await page.evaluate(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((n) => parseFloat(n));
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const backdrop = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.95) return bg;
      n = n.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body && body.a > 0.95 ? body : { r: 255, g: 255, b: 255, a: 1 };
  };

  // Foreground alpha has to be composited over the resolved backdrop before
  // measuring, or rgba(255,255,255,0.35) reads as pure white and passes.
  const composite = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1
  });

  const out = [];
  const seen = new Set();
  document.querySelectorAll("body *").forEach((el) => {
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ");
    if (!text) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.15) return;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.15) return;
    const bg = backdrop(el);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const r = ratio(composite(fg, bg), bg);
    if (r < need) {
      const key = text.slice(0, 40) + cs.color;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        text: text.slice(0, 48),
        color: cs.color,
        bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
        size,
        ratio: Math.round(r * 100) / 100,
        need
      });
    }
  });
  return out;
});

console.log(`\n=== TEXT CONTRAST: ${url} [${dark ? "dark" : "light"}] ===`);
console.log(`failing text nodes: ${rows.length}`);
rows.slice(0, 25).forEach((r) =>
  console.log(
    `  ${r.ratio}:1 (need ${r.need})  ${r.size}px  ${r.color} on ${r.bg}  "${r.text}"`
  )
);

await browser.close();
process.exit(rows.length ? 1 : 0);

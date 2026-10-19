// tools/reference_audit.mjs
//
// Read a public marketing page in an ordinary browser and dump the design
// system a visitor's own CSSOM already computes: colour/type/radius/spacing
// scales, the animation inventory, and the top-level layout structure.
//
// This is what "looking at a site carefully" produces. It does not extract
// source, copy, images, or any non-public data — only computed style values
// that every visitor's browser resolves anyway.
//
// Usage: node tools/reference_audit.mjs <url>

import { chromium } from "@playwright/test";

const url = process.argv[2];
if (!url) {
  console.error("usage: node tools/reference_audit.mjs <url>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2500);

const out = await page.evaluate(`(() => {
  const els = [...document.querySelectorAll("body *")];
  const bump = (o, k) => { if (k !== undefined && k !== null && k !== "") o[k] = (o[k] || 0) + 1; };
  const colors = {}, bgs = {}, fonts = {}, sizes = {}, weights = {}, radii = {}, shadows = {};
  const gaps = {}, pads = {}, radiusPx = {}, transitions = {}, maxWidths = {};
  let textCount = 0;

  for (const el of els) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    bump(bgs, cs.backgroundColor);
    bump(radii, cs.borderRadius);
    if (cs.boxShadow && cs.boxShadow !== "none") bump(shadows, cs.boxShadow.slice(0, 60));
    if (cs.maxWidth && cs.maxWidth !== "none") bump(maxWidths, cs.maxWidth);

    // spacing scale
    for (const p of ["paddingTop","paddingRight","paddingBottom","paddingLeft"]) {
      const v = cs[p];
      if (v && v !== "0px") bump(pads, v);
    }
    if (cs.gap && cs.gap !== "normal") bump(gaps, cs.gap);
    if (cs.marginTop && cs.marginTop !== "0px") bump(gaps, cs.marginTop);

    // motion inventory
    const td = cs.transitionDuration;
    if (td && td !== "0s") bump(transitions, td + " | " + cs.transitionTimingFunction);
    const an = cs.animationName;
    if (an && an !== "none") bump(transitions, "ANIM " + an + " " + cs.animationDuration + " " + cs.animationTimingFunction);

    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    textCount++;
    bump(colors, cs.color);
    bump(fonts, cs.fontFamily);
    bump(sizes, cs.fontSize);
    bump(weights, cs.fontWeight);
  }

  // structural overview: direct children of <body> / main containers
  const struct = [];
  const roots = [...document.querySelectorAll("body > div, body > header, body > main, body > section, body > footer")];
  function walk(node, depth) {
    if (depth > 3) return;
    for (const el of [...node.children]) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      struct.push({
        d: depth,
        t: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : "").split(" ").slice(0,4).join("."),
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
        grid: cs.gridTemplateColumns && cs.gridTemplateColumns !== "none" ? cs.gridTemplateColumns.slice(0,60) : "",
        gap: cs.gap
      });
      walk(el, depth + 1);
      if (struct.length > 140) return;
    }
  }
  walk({ children: roots }, 0);

  return { colors, bgs, fonts, sizes, weights, radii, shadows, gaps, pads, maxWidths, transitions, struct, textCount,
           pageH: document.documentElement.scrollHeight };
})()`);

const top = (o, n) =>
  Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([k, v]) => `${String(v).padStart(4)}  ${k}`).join("\n");

console.log(`\n################ ${url} ################`);
console.log(`page height ${out.pageH}px · ${out.textCount} text nodes\n`);

console.log(`── TEXT COLOURS (${Object.keys(out.colors).length}) ──\n${top(out.colors, 10)}`);
console.log(`\n── BACKGROUNDS (${Object.keys(out.bgs).length}) ──\n${top(out.bgs, 8)}`);
console.log(`\n── FONT FAMILY (${Object.keys(out.fonts).length}) ──\n${top(out.fonts, 4)}`);
console.log(`\n── TYPE SCALE (${Object.keys(out.sizes).length}) ──\n${top(out.sizes, 16)}`);
console.log(`\n── WEIGHTS ──\n${top(out.weights, 8)}`);
console.log(`\n── RADII (${Object.keys(out.radii).length}) ──\n${top(out.radii, 8)}`);
console.log(`\n── SHADOWS (${Object.keys(out.shadows).length}) ──\n${top(out.shadows, 5)}`);
console.log(`\n── CONTAINER MAX-WIDTHS ──\n${top(out.maxWidths, 6)}`);
console.log(`\n── SPACING / PADDING (${Object.keys(out.pads).length} values) ──\n${top(out.pads, 16)}`);
console.log(`\n── GAPS / MARGINS (${Object.keys(out.gaps).length}) ──\n${top(out.gaps, 14)}`);
console.log(`\n── MOTION (${Object.keys(out.transitions).length} distinct) ──\n${top(out.transitions, 16)}`);

console.log(`\n── LAYOUT STRUCTURE (top 3 levels) ──`);
for (const s of out.struct.slice(0, 90)) {
  const pad = "  ".repeat(s.d);
  console.log(`${pad}${s.t}.${(s.cls || "").slice(0,44)}  ${s.w}x${s.h}  ${s.display}${s.grid ? "  [" + s.grid + "]" : ""}${s.gap !== "normal" ? "  gap:" + s.gap : ""}`);
}

await browser.close();

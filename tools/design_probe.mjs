// tools/design_probe.mjs
//
// Dumps the STRUCTURE of a marketing page: section order, hero composition,
// button recipes, card recipes and nav treatment. Complements reference_audit
// (tokens) — this is about how the tokens are assembled.
//
// Usage: node tools/design_probe.mjs <url>

import { chromium } from "@playwright/test";

const url = process.argv[2];
if (!url) {
  console.error("usage: node tools/design_probe.mjs <url>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);

const out = await page.evaluate(() => {
  const cs = (el, p) => getComputedStyle(el)[p];
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return `${Math.round(r.width)}x${Math.round(r.height)}`;
  };
  const styleOf = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      box: rect(el),
      bg: s.backgroundColor,
      bgImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 90),
      color: s.color,
      radius: s.borderRadius,
      border: s.border,
      font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.fontFamily.split(",")[0]}`,
      padding: s.padding,
      shadow: s.boxShadow === "none" ? null : s.boxShadow.slice(0, 80)
    };
  };

  const header = document.querySelector("header");
  const h1 = document.querySelector("h1");
  const heroCtas = h1
    ? [...h1.closest("section,div")?.querySelectorAll?.("a,button") || []].slice(0, 4)
    : [];
  const buttons = [...document.querySelectorAll("a,button")]
    .filter((b) => {
      const s = getComputedStyle(b);
      return s.backgroundColor !== "rgba(0, 0, 0, 0)" && b.innerText.trim().length > 2;
    })
    .slice(0, 3)
    .map((b) => ({ text: b.innerText.trim().slice(0, 24), ...styleOf(b) }));

  const sections = [...document.querySelectorAll("section")].slice(0, 10).map((s, i) => {
    const st = styleOf(s);
    return {
      i,
      box: st.box,
      bg: st.bg,
      bgImage: st.bgImage,
      heading: s.querySelector("h1,h2")?.innerText.replace(/\n/g, " ").slice(0, 70),
      images: s.querySelectorAll("img,svg").length,
      cards: [...s.querySelectorAll("div")].filter((d) => {
        const c = getComputedStyle(d);
        return parseFloat(c.borderRadius) >= 8 && c.borderTopWidth !== "0px";
      }).length
    };
  });

  const images = [...document.querySelectorAll("img")]
    .slice(0, 8)
    .map((im) => ({
      src: (im.currentSrc || im.src || "").split("/").slice(-1)[0].slice(0, 50),
      box: rect(im),
      radius: cs(im, "borderRadius")
    }));

  return {
    header: styleOf(header),
    headerInner: header ? styleOf(header.firstElementChild) : null,
    h1: h1 ? { text: h1.innerText.replace(/\n/g, " "), ...styleOf(h1), align: cs(h1, "textAlign") } : null,
    heroCtas: heroCtas.map((b) => ({ text: b.innerText.trim().slice(0, 22), ...styleOf(b) })),
    buttons,
    sections,
    images,
    body: styleOf(document.body)
  };
});

console.log(JSON.stringify(out, null, 2));
await browser.close();

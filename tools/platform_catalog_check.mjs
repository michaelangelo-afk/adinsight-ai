#!/usr/bin/env node
/**
 * Validate lib/platforms/catalog.json and print the matrices used in
 * docs/FREE-AD-PLATFORMS-NIGERIA.md.
 *
 * Usage:
 *   node tools/platform_catalog_check.mjs
 *   node tools/platform_catalog_check.mjs --markdown > /tmp/matrix.md
 *
 * Exit codes: 0 valid, 1 invalid.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(here, "../lib/platforms/catalog.json");
const channels = JSON.parse(readFileSync(catalogPath, "utf8"));
const markdown = process.argv.includes("--markdown");

const errors = [];
const fail = (msg) => errors.push(msg);

const ids = new Set();
const WAVES = new Set([1, 2, 3, 4]);
const WRITE = new Set(["full", "read-only", "assisted", "none"]);
const GATES = new Set([
  "none",
  "account",
  "app-review",
  "business-verification",
  "partner",
  "sales-led",
]);
const METRICS = new Set([
  "ad-reach",
  "monthly-visits",
  "members",
  "browser-share",
  "percent-internet-users",
  "listings",
  "devices",
  "unknown",
]);

for (const c of channels) {
  const where = c.id ?? "(missing id)";
  if (!c.id || typeof c.id !== "string") fail(`${where}: id is required`);
  if (ids.has(c.id)) fail(`${where}: duplicate id`);
  ids.add(c.id);

  if (!c.name) fail(`${where}: name is required`);
  if (!WAVES.has(c.wave)) fail(`${where}: wave must be 1–4`);
  if (!WRITE.has(c.api?.write)) fail(`${where}: bad api.write`);
  if (!GATES.has(c.api?.gate)) fail(`${where}: bad api.gate`);
  if (!METRICS.has(c.reach?.metric)) fail(`${where}: bad reach.metric`);
  if (!["S", "M", "L"].includes(c.effort)) fail(`${where}: bad effort`);
  if (!c.reach?.source) fail(`${where}: reach.source is required`);
  if (!c.api?.docs?.startsWith("http"))
    fail(`${where}: api.docs must be an http(s) URL`);
  if (!c.playbook) fail(`${where}: playbook is required`);

  if (c.reach?.value !== null && !(typeof c.reach.value === "number" && c.reach.value > 0))
    fail(`${where}: reach.value must be null or a positive number`);

  if (c.api?.write === "full") {
    if (!c.api.read) fail(`${where}: full write requires api.read`);
    if (!c.automation?.officialApi)
      fail(`${where}: full write must be an official API`);
  }
  if (c.api?.write === "assisted" && c.automation?.officialApi)
    fail(`${where}: assisted write cannot claim an official API`);
  if (c.automation?.browserAutomation === "prohibited" && c.automation?.playwrightVerdict !== "never")
    fail(`${where}: prohibited browser automation must be playwright "never"`);
  if (c.automation?.playwrightVerdict === "assisted-only")
    fail(`${where}: Playwright posting is not an approved transport`);
}

if (channels.length < 20) fail(`catalog: expected at least 20 channels, got ${channels.length}`);

const officialWrite = channels.filter((c) => c.api.write === "full");
if (officialWrite.length < 10)
  fail(`catalog: expected at least 10 official write APIs, got ${officialWrite.length}`);

const byWave = (w) => channels.filter((c) => c.wave === w);
for (const w of [1, 2, 3, 4]) {
  if (byWave(w).length === 0) fail(`catalog: wave ${w} is empty`);
}

if (errors.length) {
  console.error(`FAIL ${errors.length} problem(s) in ${catalogPath}`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const nf = new Intl.NumberFormat("en-NG");
const reachLabel = (c) => {
  if (c.reach.value === null) return "—";
  switch (c.reach.metric) {
    case "browser-share":
    case "percent-internet-users":
      return `${c.reach.value}%`;
    case "ad-reach":
    case "monthly-visits":
    case "members":
      return `${nf.format(c.reach.value)} ${c.reach.unit}`;
    default:
      return `${nf.format(c.reach.value)} ${c.reach.unit}`;
  }
};

const table = (headers, rows) => {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length))
  );
  const line = (cells) =>
    `| ${cells.map((cell, i) => String(cell).padEnd(widths[i])).join(" | ")} |`;
  return [line(headers), `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`, ...rows.map(line)].join(
    "\n"
  );
};

if (markdown) {
  console.log("### Reach and cost\n");
  console.log(
    table(
      ["Channel", "Nigerian signal", "As of", "Entry cost", "Benchmark"],
      channels.map((c) => [
        c.name,
        reachLabel(c),
        c.reach.asOf,
        c.economics.entry,
        c.economics.benchmark,
      ])
    )
  );

  console.log("\n### Automation and API\n");
  console.log(
    table(
      ["Channel", "Read", "Write", "Gate", "API cost", "Playwright"],
      channels.map((c) => [
        c.name,
        c.api.read ? "yes" : "no",
        c.api.write,
        c.api.gate,
        c.api.cost,
        c.automation.playwrightVerdict,
      ])
    )
  );

  console.log("\n### Build order\n");
  console.log(
    table(
      ["Wave", "Channel", "Effort", "Playbook"],
      [...channels]
        .sort((a, b) => a.wave - b.wave || a.name.localeCompare(b.name))
        .map((c) => [c.wave, c.name, c.effort, c.playbook])
    )
  );
} else {
  console.log(`OK ${channels.length} channels in ${catalogPath}`);
  console.log(
    `official write: ${officialWrite.length} · assisted/none: ${
      channels.length - officialWrite.length
    } · Playwright posting: 0`
  );
  for (const w of [1, 2, 3, 4]) {
    console.log(
      `wave ${w}: ${byWave(w)
        .map((c) => `${c.name} (${c.effort})`)
        .join(", ")}`
    );
  }
}

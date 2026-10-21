// tools/platform_logo_check.mjs
//
// Guardrail for the channels board: every channel in the capability catalog
// must have a real logo asset in public/platform-logos, and every mapped file
// must exist on disk. A missing entry means the UI would fall back to a group
// icon — the exact placeholder this project decided not to ship.
//
// Usage: node tools/platform_logo_check.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "lib/platforms/catalog.json"), "utf8")
);
const registry = fs.readFileSync(
  path.join(root, "lib/platforms/logos.ts"),
  "utf8"
);

const entries = [
  ...registry.matchAll(/^\s*"?([a-z0-9-]+)"?\s*:\s*"(\/platform-logos\/[^"]+)"/gm)
];
const logos = new Map(entries.map(([, id, file]) => [id, file]));

const missing = catalog.filter((channel) => !logos.has(channel.id));
const broken = entries.filter(([, , file]) => {
  return !fs.existsSync(path.join(root, "public", file));
});

console.log(`catalog channels: ${catalog.length}`);
console.log(`mapped logos: ${logos.size}`);
console.log(`missing logos: ${missing.length ? missing.map((c) => c.id).join(", ") : "none"}`);
console.log(
  `missing files: ${broken.length ? broken.map(([, id, file]) => `${id} (${file})`).join(", ") : "none"}`
);

process.exit(missing.length || broken.length ? 1 : 0);

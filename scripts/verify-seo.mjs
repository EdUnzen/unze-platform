#!/usr/bin/env node
/**
 * Abnahme: SEO — Metadata, Struktur, Business-Seiten.
 * Usage: npm run verify:seo [--url=https://www.unze.app]
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv.find((a) => a.startsWith("--url="))?.slice(6) ?? "https://www.unze.app";

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function check(name, pass) {
  checks.push({ name, pass });
}

function walkPages(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "shop") continue; // Redirect-only — kein öffentlicher Shop mehr
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkPages(p);
    else if (name === "page.tsx") {
      const text = readFileSync(p, "utf8");
      const rel = p.replace(root + "\\", "").replace(/\\/g, "/");
      check(`${rel}: metadata`, text.includes("export const metadata") || text.includes("export const metadata:"));
      check(`${rel}: title`, text.includes("title"));
      if (!text.includes("robots: { index: false }")) {
        check(`${rel}: description`, text.includes("description"));
      }
    }
  }
}

walkPages(join(root, "app/(business)/business"));

try {
  const copy = readFileSync(join(root, "lib/constants/business-copy.ts"), "utf8");
  check("business-copy.meta.title", copy.includes("meta:") && copy.includes("title:"));
  check("business-copy.meta.description", copy.includes("description:"));
} catch {
  check("business-copy.ts meta", false);
}

check("robots.txt", statSync(join(root, "app/robots.ts"), { throwIfNoEntry: false }) != null);
check("sitemap", statSync(join(root, "app/sitemap.ts"), { throwIfNoEntry: false }) != null);

async function liveSeo(path) {
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`);
    const html = await res.text();
    check(`${path} <title>`, html.includes("<title>") && !html.includes("<title></title>"));
    check(`${path} meta description`, /name="description"/i.test(html));
    check(`${path} lang`, html.includes('lang="'));
  } catch {
    check(`${path} live SEO`, false);
  }
}

await liveSeo("/business");
await liveSeo("/business/business-core");
await liveSeo("/business/kontakt");

let allPass = true;
console.log(`verify:seo — ${base}\n`);
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

#!/usr/bin/env node
/**
 * Abnahme: Marketing / Landing — Copy, Demo-Standard, öffentliche Routen.
 * Usage: npm run verify:marketing [--url=https://www.unze.app]
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv.find((a) => a.startsWith("--url="))?.slice(6) ?? "https://www.unze.app";

const FORBIDDEN_PUBLIC = [/Becker Logistik/i, /beckerlog/i, /st\\u00f6/i];
const SKIP = new Set(["node_modules", ".next", ".git", "_tmp"]);
const SCAN = ["components/landing", "components/business", "lib/constants"];

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function walk(dir, fn) {
  if (!statSync(dir, { throwIfNoEntry: false })) return;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, fn);
    else if (/\.(tsx|ts)$/.test(name)) fn(p, readFileSync(p, "utf8"));
  }
}

function assertFile(rel, includes = []) {
  const p = join(root, rel);
  try {
    const text = readFileSync(p, "utf8");
    const ok = includes.every((s) => text.includes(s));
    checks.push({ name: `Datei ${rel}`, pass: ok });
  } catch {
    checks.push({ name: `Datei ${rel}`, pass: false });
  }
}

let forbiddenFound = false;

for (const dir of SCAN) {
  walk(join(root, dir), (p, text) => {
    for (const re of FORBIDDEN_PUBLIC) {
      if (re.test(text)) {
        forbiddenFound = true;
        checks.push({
          name: `Verbotener Inhalt in ${p.replace(root + "\\", "")}`,
          pass: false,
        });
      }
    }
  });
}
checks.push({
  name: "Keine verbotenen Namen in Marketing/Business-Code",
  pass: !forbiddenFound,
});

assertFile("lib/constants/landing-copy.ts", ["LANDING_HERO", "LANDING_CTA"]);
assertFile("lib/constants/platform-copy.ts", ["PLATFORM_TAGLINE"]);
assertFile("lib/constants/demo-companies.ts", ["DEMO_DATA_DISCLAIMER", "Muster Logistics GmbH"]);
assertFile("lib/constants/cta-copy.ts", ["CTA_APP_USE"]);

async function fetchCheck(path, needle) {
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`, { redirect: "follow" });
    const text = await res.text();
    checks.push({
      name: `${path} live (${base})`,
      pass: res.ok && (!needle || text.includes(needle)),
    });
  } catch {
    checks.push({ name: `${path} live`, pass: false });
  }
}

await fetchCheck("/", "UNZE");
await fetchCheck("/communities", "Communities");

let allPass = true;
console.log(`verify:marketing — ${base}\n`);
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

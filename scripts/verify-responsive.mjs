#!/usr/bin/env node
/**
 * Abnahme: Responsivität — Breakpoints in Business-UI.
 * Usage: npm run verify:responsive
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIRS = [
  "components/business",
  "app/(business)/business",
];

const MIN_BREAKPOINTS = ["sm:", "md:", "lg:"];
const MIN_FILES_WITH_RESPONSIVE = 8;

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

let responsiveFiles = 0;
let totalTsx = 0;

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) scan(p);
    else if (name.endsWith(".tsx")) {
      totalTsx++;
      const text = readFileSync(p, "utf8");
      const hasAll = MIN_BREAKPOINTS.every((bp) => text.includes(bp));
      if (hasAll || (text.includes("md:") && text.includes("sm:"))) {
        responsiveFiles++;
      }
    }
  }
}

for (const d of BUSINESS_DIRS) {
  scan(join(root, d));
}

checks.push({ name: `Business-TSX-Dateien (${totalTsx})`, pass: totalTsx >= 10 });
checks.push({
  name: `Responsive Patterns (≥${MIN_FILES_WITH_RESPONSIVE} Dateien)`,
  pass: responsiveFiles >= MIN_FILES_WITH_RESPONSIVE,
});

try {
  const header = readFileSync(join(root, "components/business/BusinessHeader.tsx"), "utf8");
  checks.push({
    name: "BusinessHeader Navigation",
    pass: header.includes("href") || header.includes("Link"),
  });
} catch {
  checks.push({ name: "BusinessHeader.tsx", pass: false });
}

let allPass = true;
console.log("verify:responsive\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log(`  (${responsiveFiles}/${totalTsx} Dateien mit Responsive-Klassen)\n`);
process.exit(allPass ? 0 : 1);

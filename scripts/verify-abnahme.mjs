#!/usr/bin/env node
/**
 * Vollständige Produktions-Abnahme UNZE Business.
 * Usage: npm run verify:abnahme [--url=https://www.unze.app]
 */
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const urlArg = process.argv.find((a) => a.startsWith("--url="));
const extra = urlArg ? [urlArg] : [];

const steps = [
  { name: "validate:quick", cmd: "npm", args: ["run", "validate:quick"] },
  { name: "verify:design", cmd: "npm", args: ["run", "verify:design"] },
  { name: "verify:analysis", cmd: "npm", args: ["run", "verify:analysis"] },
  { name: "verify:responsive", cmd: "npm", args: ["run", "verify:responsive"] },
  { name: "verify:marketing", cmd: "npm", args: ["run", "verify:marketing", "--", ...extra] },
  { name: "verify:business", cmd: "npm", args: ["run", "verify:business", "--", ...extra] },
  { name: "verify:seo", cmd: "npm", args: ["run", "verify:seo", "--", ...extra] },
  { name: "verify:performance", cmd: "npm", args: ["run", "verify:performance"] },
  { name: "verify:accessibility", cmd: "npm", args: ["run", "verify:accessibility"] },
  { name: "verify:conversion", cmd: "npm", args: ["run", "verify:conversion", "--", ...extra] },
];

console.log("UNZE Business — Gesamtabnahme\n");

let failed = false;
for (const step of steps) {
  console.log(`--- ${step.name} ---`);
  const r = spawnSync(step.cmd, step.args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.log(`\n[FAIL] ${step.name}\n`);
    failed = true;
  } else {
    console.log(`\n[OK] ${step.name}\n`);
  }
}

if (failed) {
  console.log("Gesamtabnahme fehlgeschlagen.");
  process.exit(1);
}
console.log("Alle Abnahme-Checks bestanden.");

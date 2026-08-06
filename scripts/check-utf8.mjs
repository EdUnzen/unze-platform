#!/usr/bin/env node
/**
 * Blockiert Mojibake, ungueltige UTF-8 und literale \\uXXXX-Escapes in Quelltext.
 * Usage: npm run check:utf8
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXTS = new Set([".ts", ".tsx"]);
const SKIP = new Set(["node_modules", ".next", ".git"]);
const SCAN_DIRS = ["app", "components", "lib", "services", "types"];

const MOJIBAKE = [
  /\uFFFD/,
  /[\u0080-\u009F]/,
  /Men\uFFFD schlie/,
  /pers\uFFFDn/,
  /Schlie\uFFFDen/,
  /best\uFFFDtigt/,
  /Pr\uFFFDfe/,
  /Zur\uFFFDck/,
  /\uFFFDffentliche/,
  /ung\uFFFDltig/,
  /erf\uFFFDllt/,
  /f\uFFFDr /,
  /verf\uFFFDgbar/,
  /Antr[\u009D\uFFFD]ge/,
  /Men[\u009D\uFFFD] /,
];

/** Literale Escapes — in JSX-Text unsichtbar kaputt, in .ts unnötig. */
const UNICODE_ESCAPE = /\\u[0-9a-fA-F]{4}/;

/** @type {string[]} */
const failures = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXTS.has(extname(name))) {
      const buf = readFileSync(p);
      let text;
      try {
        text = buf.toString("utf8");
      } catch {
        failures.push(`${p}: invalid UTF-8 buffer`);
        continue;
      }
      for (const re of MOJIBAKE) {
        if (re.test(text)) {
          failures.push(`${p}: mojibake matches ${re}`);
          break;
        }
      }
      if (UNICODE_ESCAPE.test(text)) {
        failures.push(`${p}: contains literal \\uXXXX escape (use UTF-8 characters)`);
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  walk(join(root, dir));
}

if (failures.length > 0) {
  console.error("UTF-8 check failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("UTF-8 check passed.");

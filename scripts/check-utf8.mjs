#!/usr/bin/env node
/**
 * Blockiert Mojibake / ungueltige UTF-8 in Quelltext.
 * Usage: npm run check:utf8
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXTS = new Set([".ts", ".tsx"]);
const SKIP = new Set(["node_modules", ".next", ".git"]);

const MOJIBAKE = [
  /\uFFFD/,
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
];

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
          failures.push(`${p}: matches ${re}`);
          break;
        }
      }
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error("UTF-8 check failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("UTF-8 check passed.");

#!/usr/bin/env node
/**
 * Ersetzt literale \\uXXXX-Sequenzen durch echte UTF-8-Zeichen in .ts/.tsx.
 * Behebt sichtbare "st\\u00f6bern" in JSX-Textknoten.
 * Usage: node scripts/fix-unicode-escapes.mjs [--check]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXTS = new Set([".ts", ".tsx"]);
const SKIP = new Set(["node_modules", ".next", ".git"]);
const CHECK_ONLY = process.argv.includes("--check");

const ESCAPE_RE = /\\u([0-9a-fA-F]{4})/g;

function decodeEscapes(text) {
  return text.replace(ESCAPE_RE, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/** @type {{ path: string; count: number }[]} */
const changed = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXTS.has(extname(name))) {
      const raw = readFileSync(p, "utf8");
      if (!ESCAPE_RE.test(raw)) continue;
      ESCAPE_RE.lastIndex = 0;
      const next = decodeEscapes(raw);
      const matches = (raw.match(ESCAPE_RE) ?? []).length;
      ESCAPE_RE.lastIndex = 0;
      if (next !== raw) {
        changed.push({ path: p, count: matches });
        if (!CHECK_ONLY) writeFileSync(p, next, "utf8");
      }
    }
  }
}

walk(join(root, "app"));
walk(join(root, "components"));
walk(join(root, "lib"));
walk(join(root, "services"));
walk(join(root, "types"));

if (changed.length === 0) {
  console.log(CHECK_ONLY ? "No unicode escapes found." : "Nothing to fix.");
  process.exit(0);
}

console.log(
  (CHECK_ONLY ? "Found " : "Fixed ") +
    changed.length +
    " file(s), " +
    changed.reduce((n, c) => n + c.count, 0) +
    " escape(s):"
);
for (const c of changed.slice(0, 30)) {
  console.log(`  ${c.path.replace(root + "\\", "")} (${c.count})`);
}
if (changed.length > 30) console.log(`  ... +${changed.length - 30} more`);

if (CHECK_ONLY) process.exit(1);

#!/usr/bin/env node
/**
 * Setzt NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (nur lokal, nicht committen).
 * Usage: set UNZE_PATCH_ANON_KEY=<key> && node scripts/patch-env-local-anon.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { validateAnonKey } from "./lib/supabase-anon-key.mjs";

const root = process.cwd();
const envPath = join(root, ".env.local");
const newKey = process.env.UNZE_PATCH_ANON_KEY?.trim();

if (!newKey) {
  console.error("✗ UNZE_PATCH_ANON_KEY nicht gesetzt");
  process.exit(1);
}

const check = validateAnonKey(newKey);
if (!check.ok) {
  console.error("✗ Key-Format:", check.detail);
  process.exit(1);
}

let lines = [];
if (existsSync(envPath)) {
  lines = readFileSync(envPath, "utf8").split(/\r?\n/);
}

const varName = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
let found = false;
const out = lines.map((line) => {
  if (line.trim().startsWith(`${varName}=`)) {
    found = true;
    return `${varName}=${newKey}`;
  }
  return line;
});

if (!found) {
  out.push(`${varName}=${newKey}`);
}

writeFileSync(envPath, out.join("\n").replace(/\n*$/, "\n") + "\n", "utf8");
console.log(`✓ ${varName} in .env.local aktualisiert (${check.detail})`);

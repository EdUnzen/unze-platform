#!/usr/bin/env node
/**
 * Setzt SUPABASE_DB_PASSWORD in .env.local (nur lokal, nicht committen).
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
const password = process.env.UNZE_PATCH_DB_PASSWORD?.trim();

if (!password) {
  console.error("✗ UNZE_PATCH_DB_PASSWORD nicht gesetzt");
  process.exit(1);
}

let lines = [];
if (existsSync(envPath)) {
  lines = readFileSync(envPath, "utf8").split(/\r?\n/);
}

const varName = "SUPABASE_DB_PASSWORD";
let found = false;
const out = lines.map((line) => {
  if (line.trim().startsWith(`${varName}=`)) {
    found = true;
    return `${varName}=${password}`;
  }
  return line;
});

if (!found) {
  out.push(`${varName}=${password}`);
}

writeFileSync(envPath, out.join("\n").replace(/\n*$/, "\n") + "\n", "utf8");
console.log(`✓ ${varName} in .env.local gesetzt`);

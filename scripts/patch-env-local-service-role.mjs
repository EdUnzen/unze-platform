#!/usr/bin/env node
/**
 * Setzt SUPABASE_SERVICE_ROLE_KEY in .env.local (nur lokal).
 * Usage: set UNZE_PATCH_SERVICE_ROLE_KEY=<key> && node scripts/patch-env-local-service-role.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const envPath = join(root, ".env.local");
const newKey = process.env.UNZE_PATCH_SERVICE_ROLE_KEY?.trim();

if (!newKey) {
  console.error("✗ UNZE_PATCH_SERVICE_ROLE_KEY nicht gesetzt");
  process.exit(1);
}

if (!newKey.startsWith("eyJ") || newKey.split(".").length !== 3) {
  console.error("✗ Erwartet Legacy JWT (eyJ…, 3 Segmente)");
  process.exit(1);
}

let lines = [];
if (existsSync(envPath)) {
  lines = readFileSync(envPath, "utf8").split(/\r?\n/);
}

const varName = "SUPABASE_SERVICE_ROLE_KEY";
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
console.log(`✓ ${varName} in .env.local aktualisiert (${newKey.length} Zeichen)`);

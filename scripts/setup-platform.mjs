#!/usr/bin/env node
/**
 * Vollständiges Platform-Setup: Migrate → Seed → Verify
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

async function tableExists(url, key, table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.status === 200 || res.status === 206;
}

async function main() {
  console.log("\n=== UNZE Platform Setup ===\n");

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  run("node scripts/bundle-migrations.mjs");

  const hasSchema = await tableExists(url, anonKey, "communities");

  if (!hasSchema) {
    if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
      run("node scripts/apply-migrations.mjs");
    } else {
      console.log("\n⚠ Schema fehlt in Supabase.\n");
      console.log("Option A — SQL Editor (empfohlen):");
      console.log("  1. Öffne Supabase → SQL Editor");
      console.log("  2. Führe database/BUNDLE_all_migrations.sql aus\n");
      console.log("Option B — CLI:");
      console.log("  SUPABASE_DB_URL=postgresql://... npm run db:migrate\n");
      process.exit(1);
    }
  } else {
    console.log("✓ Schema vorhanden\n");
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY fehlt — Seed nicht möglich.");
    console.error("  Supabase → Settings → API → service_role → .env.local\n");
    process.exit(1);
  }

  run("node scripts/seed-demo-platform.mjs");
  run("node scripts/verify-demo-data.mjs");
}

main();

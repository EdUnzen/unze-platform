#!/usr/bin/env node
/**
 * Wartet auf Schema (nach SQL Editor) → Seed → Verify → E2E URLs
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const POLL_MS = 5000;
const MAX_WAIT_MS = 180000;

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

async function schemaReady(url, key) {
  const res = await fetch(`${url}/rest/v1/communities?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.status === 200 || res.status === 206;
}

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryMigrate(env) {
  if (env.SUPABASE_DB_URL || env.SUPABASE_DB_PASSWORD || env.DATABASE_URL) {
    console.log("\n→ Versuche npm run db:migrate …\n");
    try {
      run("node scripts/apply-migrations.mjs");
      return true;
    } catch {
      console.log("⚠ db:migrate fehlgeschlagen — SQL Editor verwenden\n");
    }
  }
  return false;
}

async function main() {
  console.log("\n=== UNZE Full Setup ===\n");

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    console.error("✗ Supabase URL/Anon Key fehlt");
    process.exit(1);
  }

  if (!(await schemaReady(url, anonKey))) {
    await tryMigrate(env);
  }

  if (!(await schemaReady(url, anonKey))) {
    console.log("⚠ Schema fehlt noch.\n");
    console.log("  Führe JETZT im Supabase SQL Editor aus:");
    console.log("  → database/BUNDLE_all_migrations.sql");
    console.log("  (oder nacheinander: database/parts/part1-3.sql)\n");
    console.log(`  Warte bis zu ${MAX_WAIT_MS / 1000}s …\n`);

    const start = Date.now();
    while (Date.now() - start < MAX_WAIT_MS) {
      await sleep(POLL_MS);
      if (await schemaReady(url, anonKey)) {
        console.log("✓ Schema erkannt!\n");
        break;
      }
      process.stdout.write(".");
    }
    console.log("");
  }

  if (!(await schemaReady(url, anonKey))) {
    console.error("✗ Schema immer noch nicht vorhanden. Migration zuerst ausführen.\n");
    process.exit(1);
  }

  if (!serviceKey) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local");
    console.error("  Supabase → Settings → API → service_role\n");
    process.exit(1);
  }

  run("node scripts/seed-demo-platform.mjs");
  run("node scripts/verify-demo-data.mjs");

  try {
    run("node scripts/test-e2e-urls.mjs");
  } catch {
    console.log("⚠ E2E URL Test fehlgeschlagen — Dev-Server auf Port 3002 starten\n");
  }
}

main();

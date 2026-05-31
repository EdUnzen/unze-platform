#!/usr/bin/env node
/**
 * Wendet Migrationen 021, 022 und 024 an.
 * Methoden (in Reihenfolge):
 *   1. pg — SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD
 *   2. Supabase Management API — SUPABASE_ACCESS_TOKEN
 *
 * Usage: npm run db:migrate:021-024
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();

const MIGRATION_FILES = [
  "021_platform_feature_flags.sql",
  "022_platform_core_entities.sql",
  "024_stripe_monetization_events.sql",
];

const GRANTS_FILE = "015_api_table_grants.sql";

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

function projectRef(env) {
  const ref = env.SUPABASE_PROJECT_REF;
  if (ref) return ref;
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([^.]+)\.supabase\.co/,
  );
  return match?.[1] ?? null;
}

function buildDbUrl(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return env.SUPABASE_DB_URL || env.DATABASE_URL;
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = projectRef(env);
  if (password && ref) {
    const enc = encodeURIComponent(password);
    return `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
  }
  return null;
}

const IGNORABLE = [
  "already exists",
  "duplicate key",
  "multiple primary keys",
  "duplicate_object",
];

async function runSqlPg(client, sql, label) {
  process.stdout.write(`→ ${label} … `);
  try {
    await client.query(sql);
    console.log("OK");
    return "ok";
  } catch (err) {
    const msg = err.message.toLowerCase();
    if (IGNORABLE.some((s) => msg.includes(s))) {
      console.log("SKIP (bereits vorhanden)");
      return "skip";
    }
    console.log("FEHLER");
    throw new Error(`${label}: ${err.message}`);
  }
}

async function runSqlApi(token, ref, sql, label) {
  process.stdout.write(`→ ${label} (API) … `);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const body = await res.text();
  if (!res.ok) {
    console.log("FEHLER");
    throw new Error(`${label}: HTTP ${res.status} — ${body.slice(0, 400)}`);
  }
  console.log("OK");
  return "ok";
}

async function applyViaPg(env) {
  const dbUrl = buildDbUrl(env);
  if (!dbUrl) return false;

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("\n=== UNZE Migrationen 021 + 022 + 024 (pg) ===\n");
  await client.connect();

  try {
    for (const file of MIGRATION_FILES) {
      const path = join(root, "database", "migrations", file);
      const sql = readFileSync(path, "utf8");
      await runSqlPg(client, sql, file);
    }

    const grantsPath = join(root, "database", "migrations", GRANTS_FILE);
    if (existsSync(grantsPath)) {
      await runSqlPg(client, readFileSync(grantsPath, "utf8"), GRANTS_FILE);
    }

    console.log("\n✓ Migrationen angewendet.\n");
    return true;
  } finally {
    await client.end();
  }
}

async function applyViaApi(env) {
  const token = env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRef(env);
  if (!token || !ref) return false;

  console.log("\n=== UNZE Migrationen 021 + 022 + 024 (Supabase API) ===\n");

  for (const file of MIGRATION_FILES) {
    const path = join(root, "database", "migrations", file);
    const sql = readFileSync(path, "utf8");
    await runSqlApi(token, ref, sql, file);
  }

  const grantsPath = join(root, "database", "migrations", GRANTS_FILE);
  if (existsSync(grantsPath)) {
    await runSqlApi(token, ref, readFileSync(grantsPath, "utf8"), GRANTS_FILE);
  }

  console.log("\n✓ Migrationen angewendet.\n");
  return true;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };

  if (await applyViaPg(env)) {
    console.log("→ Prüfen: npm run check:migrations\n");
    return;
  }

  if (await applyViaApi(env)) {
    console.log("→ Prüfen: npm run check:migrations\n");
    return;
  }

  console.error("\n✗ Keine DB-Verbindung möglich.\n");
  console.error("  Option A — .env.local ergänzen:");
  console.error("    SUPABASE_DB_PASSWORD=<Database-Passwort>");
  console.error("    (Supabase → Settings → Database → Database password)\n");
  console.error("  Option B — Personal Access Token:");
  console.error("    SUPABASE_ACCESS_TOKEN=<Token>");
  console.error("    (Supabase → Account → Access Tokens)\n");
  console.error("  Option C — SQL Editor:");
  console.error("    database/migrations/BUNDLE_021_024.sql\n");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗", err.message, "\n");
  process.exit(1);
});

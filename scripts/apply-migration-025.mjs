#!/usr/bin/env node
/**
 * Wendet Migration 025 an (idempotent: IF NOT EXISTS).
 * Methoden: pg (DB-URL/Passwort) → Supabase Management API (Access Token)
 * Usage: npm run db:migrate:025
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();
const MIGRATION_FILE = "025_community_level_focus.sql";
const MIGRATION = join(root, "database", "migrations", MIGRATION_FILE);

function loadEnvLocal() {
  const paths = [join(root, ".env.local"), join(root, ".env.vercel")];
  const env = {};
  for (const path of paths) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      if (!env[key]) env[key] = trimmed.slice(idx + 1).trim();
    }
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

function buildDbUrls(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return [env.SUPABASE_DB_URL || env.DATABASE_URL];
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = projectRef(env);
  if (!password || !ref) return [];
  const enc = encodeURIComponent(password);
  return [
    `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  ];
}

const IGNORABLE = [
  "already exists",
  "duplicate key",
  "multiple primary keys",
  "duplicate_object",
];

async function runSqlPg(client, sql) {
  try {
    await client.query(sql);
    return true;
  } catch (e) {
    const msg = (e.message ?? "").toLowerCase();
    if (IGNORABLE.some((s) => msg.includes(s))) return true;
    throw e;
  }
}

async function runSqlApi(token, ref, sql) {
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
    throw new Error(`HTTP ${res.status} — ${body.slice(0, 400)}`);
  }
}

async function applyViaPg(env, sql) {
  const dbUrls = buildDbUrls(env);
  if (!dbUrls.length) return false;

  console.log("Methode: PostgreSQL (pg)\n");
  let lastErr;
  for (const dbUrl of dbUrls) {
    const client = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      await runSqlPg(client, sql);
      return true;
    } catch (e) {
      lastErr = e;
    } finally {
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  if (lastErr) throw lastErr;
  return false;
}

async function applyViaApi(env, sql) {
  const token = env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRef(env);
  if (!token || !ref) return false;

  console.log("Methode: Supabase Management API\n");
  await runSqlApi(token, ref, sql);
  return true;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const sql = readFileSync(MIGRATION, "utf8");

  console.log("\n=== Migration 025 anwenden ===\n");

  if (await applyViaPg(env, sql)) {
    console.log(`✓ ${MIGRATION_FILE} erfolgreich angewendet`);
    console.log("\n→ npm run migrate:demo\n");
    return;
  }

  if (await applyViaApi(env, sql)) {
    console.log(`✓ ${MIGRATION_FILE} erfolgreich angewendet`);
    console.log("\n→ npm run migrate:demo\n");
    return;
  }

  console.error("\n✗ Keine DB-Verbindung möglich.\n");
  console.error("  Option A — .env.local:");
  console.error("    SUPABASE_DB_PASSWORD=<Database-Passwort>");
  console.error("  Option B — Access Token:");
  console.error("    SUPABASE_ACCESS_TOKEN=<Token>");
  console.error("  Option C — SQL Editor:");
  console.error(`    database/migrations/${MIGRATION_FILE}\n`);
  process.exit(1);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});

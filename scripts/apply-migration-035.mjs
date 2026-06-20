#!/usr/bin/env node
/** Usage: npm run db:migrate:035 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATION = join(root, "database", "migrations", "035_phase0_identity_requirements.sql");

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

function buildDbUrl(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return env.SUPABASE_DB_URL || env.DATABASE_URL;
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && match) {
    return `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`;
  }
  return null;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);
  if (!dbUrl) {
    console.error("? SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL erforderlich");
    process.exit(1);
  }

  if (!existsSync(MIGRATION)) {
    console.error("? Migration nicht gefunden:", MIGRATION);
    process.exit(1);
  }

  const sql = readFileSync(MIGRATION, "utf8");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("\n=== UNZE Migration 035 (Phase 0) ===\n");
  await client.connect();
  try {
    await client.query(sql);
    console.log("? 035_phase0_identity_requirements.sql angewendet\n");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("?", e.message);
  process.exit(1);
});

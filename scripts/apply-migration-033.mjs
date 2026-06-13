#!/usr/bin/env node
/** Usage: npm run db:migrate:033 — Enum + Owner-Schema in zwei Transaktionen */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const STEP_A = join(root, "database", "migrations", "033a_platform_owner_enum.sql");
const STEP_B = join(root, "database", "migrations", "033b_platform_owner_role.sql");

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

function connectionString(env) {
  const password = env.SUPABASE_DB_PASSWORD;
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!password || !match) return null;
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`;
}

async function runSql(connStr, sql, label) {
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log(`✓ ${label}`);
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const connStr = connectionString(env);
  if (!connStr) {
    console.error("✗ SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL erforderlich");
    process.exit(1);
  }

  await runSql(connStr, readFileSync(STEP_A, "utf8"), "033a — platform_role owner");
  await runSql(connStr, readFileSync(STEP_B, "utf8"), "033b — Owner-Schema");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

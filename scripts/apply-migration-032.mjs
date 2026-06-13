#!/usr/bin/env node
/** Usage: npm run db:migrate:032 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATION = join(root, "database", "migrations", "032_report_group_event_targets.sql");

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

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const password = env.SUPABASE_DB_PASSWORD;
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!password || !match) {
    console.error("✗ SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL erforderlich");
    process.exit(1);
  }
  const sql = readFileSync(MIGRATION, "utf8");
  const client = new pg.Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("✓ 032_report_group_event_targets.sql angewendet");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

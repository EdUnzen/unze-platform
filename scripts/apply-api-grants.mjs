#!/usr/bin/env node
/** Wendet database/FIX_api_grants.sql via direkte Postgres-Verbindung an */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
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

function buildDbUrl(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return env.SUPABASE_DB_URL || env.DATABASE_URL;
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && match) {
    return `postgresql://postgres.${match[1]}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
  }
  return null;
}

export async function applyApiGrants(env = { ...process.env, ...loadEnvLocal() }) {
  const dbUrl = buildDbUrl(env);
  const sqlPath = join(root, "database", "FIX_api_grants.sql");
  const sql = existsSync(sqlPath)
    ? readFileSync(sqlPath, "utf8")
    : `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;`;

  if (!dbUrl) return { ok: false, reason: "no_db_url" };

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    return { ok: true };
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("\n=== UNZE API Grants ===\n");
  const result = await applyApiGrants();
  if (!result.ok) {
    console.error("✗ SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD fehlt");
    console.error("  Alternativ: database/FIX_api_grants.sql im SQL Editor ausführen\n");
    process.exit(1);
  }
  console.log("✓ API-Grants angewendet\n");
}

if (process.argv[1]?.includes("apply-api-grants")) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

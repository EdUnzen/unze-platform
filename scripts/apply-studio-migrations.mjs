#!/usr/bin/env node
/**
 * Wendet Studio/Business-Migrationen 040–046 an.
 * Usage: npm run db:migrate:studio
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();
const STUDIO_MIGRATIONS = [
  "040_business_studio_schemas.sql",
  "041_business_analysis_inquiries.sql",
  "042_studio_quotes.sql",
  "043_studio_quote_payment_plans.sql",
  "044_fix_auth_signup_search_path.sql",
  "045_expose_studio_schemas_api.sql",
  "046_studio_clients.sql",
  "047_studio_page_analytics.sql",
];

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, idx).trim()] = value;
  }
  return env;
}

function projectRefFromUrl(url) {
  const match = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

function buildDbUrls(env) {
  const urls = [];
  if (env.SUPABASE_DB_URL) urls.push(env.SUPABASE_DB_URL);
  if (env.DATABASE_URL) urls.push(env.DATABASE_URL);

  const password = env.SUPABASE_DB_PASSWORD;
  const ref = env.SUPABASE_PROJECT_REF || projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  if (password && ref) {
    const enc = encodeURIComponent(password);
    urls.push(`postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`);
    urls.push(
      `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    );
    urls.push(
      `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    );
  }
  return [...new Set(urls)];
}

const IGNORABLE = ["already exists", "duplicate key", "multiple primary keys"];

async function tryConnect(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const urls = buildDbUrls(env);

  if (urls.length === 0) {
    console.error("✗ Keine DB-URL. SUPABASE_DB_PASSWORD in .env.local setzen.");
    process.exit(1);
  }

  console.log("\n=== UNZE Studio DB Migrate (040–047) ===\n");

  let client = null;
  let lastErr = null;
  for (const url of urls) {
    try {
      client = await tryConnect(url);
      console.log("✓ DB verbunden\n");
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!client) {
    console.error("✗ Keine DB-Verbindung möglich:", lastErr?.message);
    console.error("\nAlternative: SQL-Datei im Supabase SQL Editor ausführen:");
    console.error("  database/migrations/BUNDLE_studio_setup.sql\n");
    process.exit(1);
  }

  let applied = 0;
  let skipped = 0;

  try {
    for (const file of STUDIO_MIGRATIONS) {
      const path = join(root, "database", "migrations", file);
      const sql = readFileSync(path, "utf8");
      process.stdout.write(`→ ${file} … `);
      try {
        await client.query(sql);
        console.log("OK");
        applied++;
      } catch (err) {
        const msg = err.message.toLowerCase();
        if (IGNORABLE.some((s) => msg.includes(s))) {
          console.log("SKIP");
          skipped++;
        } else {
          console.log("FEHLER");
          console.error(`\n✗ ${file}: ${err.message}\n`);
          process.exit(1);
        }
      }
    }

    await client.query(`
      GRANT USAGE ON SCHEMA business TO service_role, postgres;
      GRANT USAGE ON SCHEMA studio TO service_role, postgres;
      GRANT USAGE ON SCHEMA studio_auth TO service_role, postgres;
    `);

    console.log(`\n✓ ${applied} Migrationen, ${skipped} übersprungen`);
    console.log("\nWichtig in Supabase Dashboard → Settings → API:");
    console.log("  Exposed schemas: business, studio, studio_auth hinzufügen\n");
  } finally {
    await client.end();
  }
}

main();

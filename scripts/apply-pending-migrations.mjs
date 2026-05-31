#!/usr/bin/env node
/**
 * Wendet fehlende Migrationen 015–024 an (pg).
 * Benötigt SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: npm run db:migrate:pending
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();

const MIGRATION_ORDER = [
  "015_api_table_grants.sql",
  "016_community_engagement_metrics.sql",
  "017_post_content_extensions.sql",
  "018_platform_types_extend.sql",
  "019_creator_referral_revenue.sql",
  "020_performance_indexes.sql",
  "021_platform_feature_flags.sql",
  "022_platform_core_entities.sql",
  "023_sync_rating_aggregates.sql",
  "024_stripe_monetization_events.sql",
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
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function buildDbUrl(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return env.SUPABASE_DB_URL || env.DATABASE_URL;
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = env.SUPABASE_PROJECT_REF;
  if (password && ref) {
    const enc = encodeURIComponent(password);
    return `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && match) {
    const enc = encodeURIComponent(password);
    return `postgresql://postgres.${match[1]}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
  }
  return null;
}

const IGNORABLE = [
  "already exists",
  "duplicate key",
  "multiple primary keys",
  "duplicate_object",
];

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);

  if (!dbUrl) {
    console.error("\n✗ SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD fehlt in .env.local\n");
    console.error("  Supabase → Settings → Database → Connection string (URI)");
    console.error("  Alternativ: 021–024 im SQL Editor ausführen:\n");
    for (const file of MIGRATION_ORDER.slice(6)) {
      console.error(`    → database/migrations/${file}`);
    }
    console.error("\n  Oder gesamtes Bundle: database/BUNDLE_all_migrations.sql\n");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("\n=== UNZE Pending Migrations (015–024) ===\n");
  await client.connect();

  let applied = 0;
  let skipped = 0;

  try {
    for (const file of MIGRATION_ORDER) {
      const path = join(root, "database", "migrations", file);
      if (!existsSync(path)) {
        console.error(`✗ Fehlt: ${file}`);
        process.exit(1);
      }
      const sql = readFileSync(path, "utf8");
      process.stdout.write(`→ ${file} … `);
      try {
        await client.query(sql);
        console.log("OK");
        applied++;
      } catch (err) {
        const msg = err.message.toLowerCase();
        if (IGNORABLE.some((s) => msg.includes(s))) {
          console.log("SKIP (bereits vorhanden)");
          skipped++;
        } else {
          console.log("FEHLER");
          console.error(`\n✗ ${file}: ${err.message}\n`);
          process.exit(1);
        }
      }
    }
    console.log(`\n✓ ${applied} angewendet, ${skipped} übersprungen\n`);
    console.log("→ Prüfen: npm run check:migrations\n");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Migrationen einzeln anwenden (pg) — robuster als ein großes Bundle.
 * Benötigt SUPABASE_DB_URL oder DATABASE_URL in .env.local
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();
const MIGRATION_ORDER = [
  "001_initial_schema.sql",
  "002_rls_policies.sql",
  "004_community_groups_discover.sql",
  "005_dashboard_member_access.sql",
  "006_community_access_governance.sql",
  "007_invite_links_approval.sql",
  "008_community_lifecycle.sql",
  "009_join_approval_modes.sql",
  "010_platform_governance.sql",
  "011_storage_proofs.sql",
  "012_verification_system.sql",
  "013_platform_events.sql",
  "014_platform_integrity.sql",
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
];

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);

  if (!dbUrl) {
    console.error("✗ SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD fehlt");
    console.error("  Supabase → Settings → Database → Connection string / Password");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("\n=== UNZE DB Migrate (einzeln) ===\n");
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
    console.log(`\n✓ ${applied} Migrationen angewendet, ${skipped} übersprungen\n`);
  } finally {
    await client.end();
  }
}

main();

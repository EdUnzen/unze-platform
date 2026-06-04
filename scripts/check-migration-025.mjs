#!/usr/bin/env node
/**
 * Prüft ob Migration 025 (teilweise) angewendet wurde.
 * Usage: node scripts/check-migration-025.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

const root = process.cwd();
const COLUMNS = {
  communities: [
    "focus_tags",
    "community_level",
    "level_score",
    "show_member_area",
  ],
  community_members: ["role_title"],
};

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
  const ref = env.SUPABASE_PROJECT_REF ?? match?.[1];
  if (password && ref) {
    const enc = encodeURIComponent(password);
    return `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`;
  }
  return null;
}

async function checkViaRest(url, serviceKey) {
  const db = createClient(url, serviceKey);
  const result = {};

  for (const col of COLUMNS.communities) {
    const { error } = await db.from("communities").select(col).limit(1);
    result[`communities.${col}`] = !error;
    if (error) result[`communities.${col}_err`] = error.message;
  }

  for (const col of COLUMNS.community_members) {
    const { error } = await db.from("community_members").select(col).limit(1);
    result[`community_members.${col}`] = !error;
    if (error) result[`community_members.${col}_err`] = error.message;
  }

  return result;
}

async function checkViaPg(dbUrl) {
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const result = {};

  for (const table of Object.keys(COLUMNS)) {
    for (const col of COLUMNS[table]) {
      const q = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, col],
      );
      result[`${table}.${col}`] = q.rowCount > 0;
    }
  }

  const idx = await client.query(
    `SELECT indexname FROM pg_indexes
     WHERE schemaname = 'public' AND indexname = 'idx_communities_level'`,
  );
  result["index.idx_communities_level"] = idx.rowCount > 0;

  await client.end();
  return result;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = buildDbUrl(env);

  console.log("\n=== Migration 025 — Spalten-Check ===\n");

  let status = {};
  if (dbUrl) {
    console.log("Quelle: information_schema (pg)\n");
    try {
      status = await checkViaPg(dbUrl);
    } catch (e) {
      console.error("pg check failed:", e.message);
      if (url && serviceKey) {
        console.log("Fallback: REST API\n");
        status = await checkViaRest(url, serviceKey);
      }
    }
  } else if (url && serviceKey) {
    console.log("Quelle: REST API (kein DB-URL)\n");
    status = await checkViaRest(url, serviceKey);
  } else {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY oder SUPABASE_DB_URL fehlt");
    process.exit(1);
  }

  const required = [
    "communities.focus_tags",
    "communities.community_level",
    "communities.level_score",
    "communities.show_member_area",
    "community_members.role_title",
  ];

  let allOk = true;
  let anyOk = false;
  for (const key of required) {
    const ok = status[key] === true;
    if (ok) anyOk = true;
    else allOk = false;
    const err = status[`${key}_err`];
    console.log(`${ok ? "✓" : "✗"} ${key}${err ? ` (${err})` : ""}`);
  }

  if (status["index.idx_communities_level"] !== undefined) {
    console.log(
      `${status["index.idx_communities_level"] ? "✓" : "✗"} index.idx_communities_level`,
    );
  }

  console.log("");
  if (allOk) {
    console.log("ERGEBNIS: Migration 025 vollständig angewendet — erneutes SQL nicht nötig.");
    console.log("Optional: npm run migrate:demo\n");
    process.exit(0);
  }
  if (anyOk) {
    console.log("ERGEBNIS: TEILWEISE angewendet — 025 erneut ausführen ist sicher (IF NOT EXISTS).");
    process.exit(2);
  }
  console.log("ERGEBNIS: Migration 025 fehlt — anwenden erforderlich.\n");
  process.exit(3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

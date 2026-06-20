#!/usr/bin/env node
/**
 * Phase 0 smoke test — schema + RPC stubs (no auth session required for DB checks).
 * Usage: npm run test:phase0
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.E2E_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://unze-platform.vercel.app";

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

const results = [];

function record(name, ok, note = "") {
  results.push({ name, ok, note });
  console.log(`${ok ? "?" : "?"} ${name}${note ? ` — ${note}` : ""}`);
}

async function checkDb(client) {
  const tables = [
    "requirement_sets",
    "requirement_nodes",
    "credentials",
    "user_credentials",
    "credential_collections",
    "credential_collection_items",
    "unze_id_verifications",
  ];

  for (const table of tables) {
    const { rows } = await client.query(
      `SELECT to_regclass($1) AS reg`,
      [`public.${table}`],
    );
    record(`Tabelle ${table}`, rows[0]?.reg !== null);
  }

  const { rows: colRows } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'unze_public_id'
  `);
  record("Spalte profiles.unze_public_id", colRows.length === 1);

  const { rows: nullIds } = await client.query(`
    SELECT COUNT(*)::int AS c FROM public.profiles WHERE unze_public_id IS NULL
  `);
  record("Backfill unze_public_id", nullIds[0].c === 0, `${nullIds[0].c} ohne ID`);

  const { rows: sample } = await client.query(`
    SELECT unze_public_id FROM public.profiles LIMIT 1
  `);
  const token = sample[0]?.unze_public_id;
  record("Sample UNZE-ID vorhanden", Boolean(token), token ? token.slice(0, 12) + "…" : "keine Profile");

  if (token) {
    const { rows: resolved } = await client.query(
      `SELECT public.resolve_unze_public_id($1) AS user_id`,
      [`UNZEID:${token}`],
    );
    record("RPC resolve_unze_public_id", Boolean(resolved[0]?.user_id));

    const fakeResource = "00000000-0000-4000-8000-000000000001";
    const { rows: evalRows } = await client.query(
      `SELECT public.evaluate_requirements($1, 'community'::public.requirement_resource_type, $2::uuid) AS r`,
      [resolved[0].user_id, fakeResource],
    );
    const evalObj = evalRows[0]?.r;
    record(
      "RPC evaluate_requirements",
      evalObj?.fulfilled === true,
      evalObj?.phase != null ? `phase ${evalObj.phase}` : "",
    );
  }

  const funcs = ["resolve_unze_public_id", "evaluate_requirements", "verify_unze_id", "generate_unze_public_id"];
  for (const fn of funcs) {
    const { rows } = await client.query(
      `SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname = 'public' AND p.proname = $1 LIMIT 1`,
      [fn],
    );
    record(`Funktion ${fn}()`, rows.length === 1);
  }
}

async function checkHttp() {
  const routes = [
    { path: "/profile/id", expectLoginRedirect: true },
    { path: "/auth/login", expectOk: true },
  ];

  for (const { path, expectLoginRedirect, expectOk } of routes) {
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      if (expectLoginRedirect) {
        const ok = res.status === 307 || res.status === 302 || res.status === 200;
        record(`HTTP ${path}`, ok, `status ${res.status}`);
      } else if (expectOk) {
        record(`HTTP ${path}`, res.status === 200, `status ${res.status}`);
      }
    } catch (err) {
      record(`HTTP ${path}`, false, err.message);
    }
  }
}

async function main() {
  console.log(`\n=== UNZE Phase 0 Smoke Test ===`);
  console.log(`Base URL: ${BASE}\n`);

  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);

  if (!dbUrl) {
    record("DB-Verbindung", false, "Credentials fehlen — nur HTTP-Checks");
    await checkHttp();
  } else {
    const client = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      record("DB-Verbindung", true);
      await checkDb(client);
    } finally {
      await client.end();
    }
    await checkHttp();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} OK\n`);
  if (failed.length) {
    console.error("Fehlgeschlagen:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

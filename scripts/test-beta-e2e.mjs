#!/usr/bin/env node
/**
 * Beta E2E smoke: HTTP routes + DB RPCs + role path checklist markers.
 * Usage: npm run test:beta
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  process.env.E2E_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://www.unze.app";

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
  console.log(`${ok ? "OK" : "FAIL"} ${name}${note ? ` � ${note}` : ""}`);
}

const PUBLIC_ROUTES = [
  "/",
  "/discover",
  "/auth/login",
  "/auth/signup",
  "/dashboard/crowd-partner",
  "/profile/auszeichnungen",
  "/profile/id",
  "/profile/tickets",
];

async function checkHttp() {
  for (const path of PUBLIC_ROUTES) {
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      const ok = res.status >= 200 && res.status < 500;
      record(`HTTP ${path}`, ok, `status ${res.status}`);
    } catch (err) {
      record(`HTTP ${path}`, false, err.message);
    }
  }
}

async function checkDb(client) {
  const { rows: col } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'credentials' AND column_name = 'category'
  `);
  record("Spalte credentials.category", col.length === 1);

  const { rows: sample } = await client.query(`
    SELECT unze_public_id FROM public.profiles LIMIT 1
  `);
  const token = sample[0]?.unze_public_id;
  if (!token) {
    record("evaluate_requirements satisfied[]", false, "keine Profile");
    return;
  }

  const { rows: resolved } = await client.query(
    `SELECT public.resolve_unze_public_id($1) AS user_id`,
    [`UNZEID:${token}`],
  );
  const userId = resolved[0]?.user_id;
  const fakeResource = "00000000-0000-4000-8000-000000000001";

  const { rows: evalRows } = await client.query(
    `SELECT public.evaluate_requirements($1, 'community'::public.requirement_resource_type, $2::uuid) AS r`,
    [userId, fakeResource],
  );
  const evalObj = evalRows[0]?.r;
  record(
    "RPC evaluate_requirements phase 1",
    evalObj?.phase === 1,
    `fulfilled=${evalObj?.fulfilled}`,
  );
  record(
    "RPC evaluate_requirements satisfied key",
    Array.isArray(evalObj?.satisfied),
  );

  const funcs = [
    "grant_credential",
    "apply_event_check_in_rewards",
    "collect_requirement_leaf_status",
  ];
  for (const fn of funcs) {
    const { rows } = await client.query(
      `SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname = 'public' AND p.proname = $1 LIMIT 1`,
      [fn],
    );
    record(`Funktion ${fn}()`, rows.length === 1);
  }
}

async function main() {
  console.log(`\n=== UNZE Beta E2E Smoke ===`);
  console.log(`Base: ${BASE}\n`);

  await checkHttp();

  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);
  if (dbUrl) {
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
  } else {
    record("DB-Verbindung", false, "Credentials fehlen");
  }

  console.log("\n--- Manuelle Rollen-Simulation (Checkliste) ---");
  for (const role of [
    "Gast",
    "Nutzer",
    "Mitglied",
    "Moderator",
    "Administrator",
    "Creator",
  ]) {
    console.log(`[ ] ${role}: siehe docs/testing/BETA_E2E_TEST_PLAN.md`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} automatisiert OK\n`);
  if (failed.length) {
    console.error("Fehlgeschlagen:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

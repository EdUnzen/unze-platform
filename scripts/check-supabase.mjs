#!/usr/bin/env node
/**
 * UNZE Supabase Health Check — prüft Verbindung, Tabellen & Storage vor lokalem E2E-Test.
 * Usage: npm run check:supabase
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateAnonKey } from "./lib/supabase-anon-key.mjs";

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
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function check(name, ok, detail = "") {
  const icon = ok ? "✓" : "✗";
  console.log(`${icon} ${name}${detail ? `: ${detail}` : ""}`);
  return ok;
}

const REQUIRED_TABLES = [
  "profiles",
  "communities",
  "community_members",
  "community_join_applications",
  "community_join_questions",
  "notifications",
  "storage_assets",
  "platform_events",
  "moderation_actions",
];

const REQUIRED_BUCKETS = [
  "community-join-proofs",
  "unze-public-media",
  "unze-private-media",
  "unze-verification-private",
];

function interpretTableStatus(status, bodyText = "") {
  if (status === 200 || status === 206) return { ok: true, detail: "OK" };
  if (status === 401)
    return {
      ok: false,
      detail: "HTTP 401 — Anon Key ungültig oder unvollständig in .env.local",
    };
  if (status === 404) return { ok: false, detail: "HTTP 404 — Tabelle fehlt" };
  if (status === 403 || bodyText.includes("permission denied")) {
    return {
      ok: false,
      detail: "permission denied (42501) — database/FIX_api_grants.sql ausführen",
    };
  }
  return { ok: false, detail: `HTTP ${status}` };
}

async function restProbeWithKey(url, key, table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  const bodyText = res.ok ? "" : await res.text();
  return { res, bodyText };
}

async function listBuckets(url, serviceKey) {
  const res = await fetch(`${url}/storage/v1/bucket`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  console.log("\n=== UNZE Supabase Health Check ===\n");

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  let failed = false;
  const warn = [];

  if (!check("NEXT_PUBLIC_SUPABASE_URL", Boolean(url))) failed = true;
  if (!check("NEXT_PUBLIC_SUPABASE_ANON_KEY", Boolean(anonKey))) failed = true;

  const keyCheck = validateAnonKey(anonKey);
  if (!check("Anon Key Format", keyCheck.ok, keyCheck.detail)) {
    failed = true;
    console.log("    → Supabase Dashboard → Project Settings → API → anon public");
  }

  if (!url || !anonKey || !keyCheck.ok) {
    console.error("\n→ .env.local mit Supabase-Keys konfigurieren.\n");
    process.exit(1);
  }

  check(
    "NEXT_PUBLIC_APP_URL",
    Boolean(env.NEXT_PUBLIC_APP_URL),
    env.NEXT_PUBLIC_APP_URL ?? "optional — Standard http://localhost:3000",
  );

  if (!serviceKey) {
    warn.push(
      "SUPABASE_SERVICE_ROLE_KEY fehlt — Signed URLs für Nachweise nutzen Session-Fallback",
    );
  } else {
    check("SUPABASE_SERVICE_ROLE_KEY", true);
  }

  if (env.NEXT_PUBLIC_DEMO_MODE === "true") {
    warn.push("NEXT_PUBLIC_DEMO_MODE=true — für echten Test auf false setzen");
  }

  console.log("\n--- REST / Tabellen ---\n");

  for (const table of REQUIRED_TABLES) {
    try {
      const { res, bodyText } = await restProbeWithKey(url, anonKey, table);
      const { ok, detail } = interpretTableStatus(res.status, bodyText);
      if (!check(`Tabelle ${table}`, ok, detail)) {
        failed = true;
        if (res.status === 404) {
          console.log(`    → Migration fehlt? Siehe database/migrations/`);
        }
        if (res.status === 401) {
          console.log(`    → Key aus Supabase Dashboard → Settings → API kopieren`);
          break;
        }
        if (detail.includes("permission denied")) {
          console.log(`    → Einmalig: database/FIX_api_grants.sql im SQL Editor`);
          break;
        }
      }
    } catch (err) {
      check(`Tabelle ${table}`, false, err.message);
      failed = true;
    }
  }

  if (serviceKey) {
    console.log("\n--- Service Role (Seed) ---\n");
    try {
      const { res, bodyText } = await restProbeWithKey(url, serviceKey, "communities");
      const denied = bodyText.includes("permission denied") || res.status === 403;
      if (denied) {
        check("Service Role DB-Zugriff", false, "permission denied — GRANTs fehlen");
        console.log("    → database/FIX_api_grants.sql im Supabase SQL Editor ausführen");
        console.log("    → Danach: npm run seed:demo");
        failed = true;
      } else {
        check("Service Role DB-Zugriff", res.ok, res.ok ? "OK" : `HTTP ${res.status}`);
        if (!res.ok) failed = true;
      }
    } catch (err) {
      check("Service Role DB-Zugriff", false, err.message);
      failed = true;
    }
  }

  console.log("\n--- Auth ---\n");

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
    });
    check("Auth API erreichbar", res.ok, res.ok ? "OK" : `HTTP ${res.status}`);
    if (!res.ok) failed = true;
  } catch (err) {
    check("Auth API erreichbar", false, err.message);
    failed = true;
  }

  console.log("\n--- Storage Buckets ---\n");

  if (serviceKey) {
    try {
      const buckets = await listBuckets(url, serviceKey);
      const names = new Set((buckets ?? []).map((b) => b.name ?? b.id));
      for (const bucket of REQUIRED_BUCKETS) {
        if (!check(`Bucket ${bucket}`, names.has(bucket))) {
          failed = true;
          console.log(`    → Migration 011_storage_proofs.sql ausführen`);
        }
      }
    } catch (err) {
      check("Storage API", false, err.message);
      failed = true;
    }
  } else {
    console.log("⊘ Bucket-Check übersprungen (Service Role Key fehlt)");
    warn.push("Bucket-Check mit SUPABASE_SERVICE_ROLE_KEY in .env.local aktivieren");
  }

  if (warn.length) {
    console.log("\n--- Hinweise ---\n");
    for (const w of warn) console.log(`⚠ ${w}`);
  }

  console.log("\n--- Nächste Schritte ---\n");
  console.log("1. Migrationen 001–015 in Supabase SQL Editor ausführen (inkl. FIX_api_grants.sql)");
  console.log("2. Auth: Redirect http://localhost:3002/auth/callback");
  console.log("3. npm run seed:demo → npm run verify:demo");
  console.log("");

  if (failed) {
    console.error("Health Check FEHLGESCHLAGEN — Schema/Storage vor E2E-Test beheben.\n");
    process.exit(1);
  }

  console.log("Health Check ERFOLGREICH — bereit für lokalen Plattformtest.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

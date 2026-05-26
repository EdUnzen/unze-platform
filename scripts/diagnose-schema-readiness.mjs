#!/usr/bin/env node
/** Diagnose: warum isPlatformSchemaReady() auf Vercel false liefert */
import { existsSync, readFileSync } from "fs";
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

function validateAnonKey(key) {
  if (!key) return { ok: false, reason: "fehlt" };
  if (/\.{2,}/.test(key) || key.includes("your-anon-key")) {
    return { ok: false, reason: "Platzhalter oder abgeschnitten (...)" };
  }
  if (key.startsWith("sb_publishable_")) {
    return {
      ok: false,
      reason:
        "Neuer Publishable Key (sb_publishable_) — lib/env.ts erwartet aktuell JWT (eyJ...). Vercel-Wert muss der legacy anon JWT sein ODER env.ts anpassen.",
    };
  }
  const parts = key.split(".");
  if (parts.length !== 3 || !key.startsWith("eyJ")) {
    return { ok: false, reason: "kein gültiger JWT (eyJ + 3 Segmente)" };
  }
  if (key.length < 150) {
    return { ok: false, reason: `zu kurz (${key.length} Zeichen) — oft abgeschnitten in Vercel UI` };
  }
  return { ok: true };
}

async function probe(url, key) {
  const res = await fetch(`${url}/rest/v1/communities?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  const body = await res.text();
  let code = null;
  try {
    code = JSON.parse(body)?.code ?? null;
  } catch {
    /* ignore */
  }
  return { status: res.status, code, body: body.slice(0, 200) };
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log("\n=== UNZE Schema Readiness Diagnose ===\n");
  console.log("Referenz (lokal .env.local + optional CLI-Overrides):\n");

  if (!url) {
    console.log("✗ NEXT_PUBLIC_SUPABASE_URL fehlt");
    process.exit(1);
  }
  console.log(`  Projekt-Ref:  ${ref ?? "UNGÜLTIG"}`);
  console.log(`  URL:          ${url}`);

  const keyCheck = validateAnonKey(key);
  console.log(
    `  Anon Key:     ${keyCheck.ok ? "✓ Format OK" : "✗ " + keyCheck.reason}`,
  );
  if (key) {
    console.log(`  Key-Länge:    ${key.length} Zeichen`);
  }

  if (!keyCheck.ok) {
    console.log("\n→ isPlatformSchemaReady() = false (Supabase-Client wird nicht erstellt)\n");
    console.log("Discover zeigt: „Datenbank-Schema fehlt in Supabase“\n");
    process.exit(1);
  }

  const result = await probe(url, key);
  console.log(`\n--- REST Probe communities ---\n`);
  console.log(`  HTTP: ${result.status}`);
  if (result.code) console.log(`  Code: ${result.code}`);
  if (result.status !== 200 && result.status !== 206) {
    console.log(`  Body: ${result.body}`);
  }

  let schemaReady = false;
  if (result.status === 200 || result.status === 206) {
    schemaReady = true;
  } else if (result.code === "PGRST205" || result.body.includes("does not exist")) {
    schemaReady = false;
  } else if (result.body.includes("permission denied")) {
    schemaReady = true; // matches schema.service.ts — grants issue, not schema banner... wait
    console.log("\n⚠ permission denied — Schema existiert, aber GRANTs fehlen.");
    console.log("  Banner würde lokal NICHT erscheinen (schema.service gibt true zurück).");
  }

  console.log(`\n→ isPlatformSchemaReady() ≈ ${schemaReady ? "true" : "false"}\n`);

  if (!schemaReady) {
    console.log("Ursachen:");
    if (result.code === "PGRST205") {
      console.log("  • Falsches Supabase-Projekt ODER Migrationen nicht ausgeführt");
      console.log("  • PostgREST Schema-Cache: Settings → API → Reload");
    }
    if (result.status === 401) {
      console.log("  • Anon Key passt nicht zur URL (falsches Projekt oder ungültiger Key)");
    }
    console.log("");
  }

  console.log("--- Vercel Checkliste (manuell vergleichen) ---\n");
  console.log("1. Vercel → unze-platform → Settings → Environment Variables");
  console.log(`2. NEXT_PUBLIC_SUPABASE_URL muss exakt sein: ${url}`);
  console.log("3. NEXT_PUBLIC_SUPABASE_ANON_KEY: gleicher JWT wie lokal (200+ Zeichen, eyJ...)");
  console.log("4. Scope: Production + Preview + Development alle setzen");
  console.log("5. Nach Änderung: Deployments → Redeploy (ohne Build-Cache)\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Legt deinen Studio-Admin-Zugang an (Supabase Auth + studio_auth).
 *
 * Usage:
 *   npm run studio:create-admin -- --email deine@email.de --password "DeinPasswort"
 *
 * Oder per Umgebungsvariable (Passwort nicht in der Shell-History):
 *   set STUDIO_ADMIN_EMAIL=deine@email.de
 *   set STUDIO_ADMIN_PASSWORD=DeinPasswort
 *   npm run studio:create-admin
 */
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
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

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || !process.argv[idx + 1]) return null;
  return process.argv[idx + 1];
}

async function findUserByEmail(admin, email) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

function projectRefFromUrl(url) {
  return url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

async function linkStudioUserViaSql(env, authUserId, email) {
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = env.SUPABASE_PROJECT_REF || projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  if (!password || !ref) return false;

  const conn = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const existing = await client.query(
      `SELECT id FROM studio_auth.users WHERE auth_user_id = $1`,
      [authUserId],
    );
    if (existing.rows[0]) {
      await client.query(
        `UPDATE studio_auth.users SET email = $2, role_id = 'super_admin', is_active = true, updated_at = now() WHERE auth_user_id = $1`,
        [authUserId, email],
      );
      console.log("✓ Studio-Zugang aktualisiert (Super Admin, direkte DB)");
    } else {
      await client.query(
        `INSERT INTO studio_auth.users (auth_user_id, email, role_id, is_active) VALUES ($1, $2, 'super_admin', true)`,
        [authUserId, email],
      );
      console.log("✓ Studio-Zugang angelegt (Super Admin, direkte DB)");
    }
    return true;
  } catch {
    return false;
  } finally {
    await client.end();
  }
}

function printDone(email, env) {
  const base = (env.NEXT_PUBLIC_APP_URL || "http://localhost:3002").replace(/\/$/, "");
  console.log(`
Fertig. Jetzt anmelden unter:

  ${base}/admin

E-Mail:    ${email}
Passwort:  (das soeben gesetzte Passwort)
`);
}

async function main() {
  const email = (getArg("--email") || process.env.STUDIO_ADMIN_EMAIL || "").trim();
  const password = getArg("--password") || process.env.STUDIO_ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error(`
UNZE Studio — Admin anlegen

Bitte E-Mail und Passwort angeben:

  npm run studio:create-admin -- --email deine@email.de --password "DeinSicheresPasswort"

Mindestens 8 Zeichen im Passwort.
`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("✗ Passwort muss mindestens 8 Zeichen haben.");
    process.exit(1);
  }

  const env = { ...loadEnvLocal(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local fehlen.");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nStudio-Admin einrichten für: ${email}\n`);

  let authUser = await findUserByEmail(admin, email);

  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { password_setup_required: true },
    });
    if (error) {
      console.error("✗ Supabase-Nutzer konnte nicht angelegt werden:", error.message);
      process.exit(1);
    }
    authUser = data.user;
    console.log("✓ Supabase-Auth-Nutzer angelegt");
  } else {
    const { error } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("✗ Passwort konnte nicht gesetzt werden:", error.message);
      process.exit(1);
    }
    console.log("✓ Bestehender Supabase-Nutzer — Passwort aktualisiert");
  }

  const studioDb = admin.schema("studio_auth");

  const { data: existingStudio, error: findError } = await studioDb
    .from("users")
    .select("id, email")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (findError) {
    const linked = await linkStudioUserViaSql(env, authUser.id, email);
    if (linked) {
      printDone(email, env);
      return;
    }
    console.error("✗ studio_auth nicht erreichbar:", findError.message);
    console.error("  → Migration: npm run db:migrate:studio");
    console.error("  → Oder: npm run studio:grant-admin -- --email", email);
    process.exit(1);
  }

  if (existingStudio) {
    const { error: updateError } = await studioDb
      .from("users")
      .update({
        email,
        role_id: "super_admin",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingStudio.id);

    if (updateError) {
      console.error("✗ Studio-Nutzer Update fehlgeschlagen:", updateError.message);
      process.exit(1);
    }
    console.log("✓ Studio-Zugang aktualisiert (Super Admin)");
  } else {
    const { error: insertError } = await studioDb.from("users").insert({
      auth_user_id: authUser.id,
      email,
      display_name: null,
      role_id: "super_admin",
      is_active: true,
    });

    if (insertError) {
      console.error("✗ Studio-Nutzer Insert fehlgeschlagen:", insertError.message);
      process.exit(1);
    }
    console.log("✓ Studio-Zugang angelegt (Super Admin)");
  }

  printDone(email, env);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

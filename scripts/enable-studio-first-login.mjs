#!/usr/bin/env node
/**
 * Bereitet Erstlogin vor: Auth-Nutzer + studio_auth, Passwort wird in der App gesetzt.
 *
 * Usage:
 *   npm run studio:enable-first-login -- --email support@unze.app
 *
 * Danach: http://localhost:3002/admin → Passwort festlegen & anmelden
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

function projectRefFromUrl(url) {
  return url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
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
  } catch (err) {
    console.error("✗ Direkte DB-Verknüpfung fehlgeschlagen:", err.message);
    return false;
  } finally {
    await client.end();
  }
}

function appUrl(env) {
  return (env.NEXT_PUBLIC_APP_URL || "http://localhost:3002").replace(/\/$/, "");
}

async function main() {
  const email = (getArg("--email") || process.env.STUDIO_ADMIN_EMAIL || "").trim();
  if (!email) {
    console.error(`
UNZE Studio — Erstlogin aktivieren

Usage:
  npm run studio:enable-first-login -- --email support@unze.app
`);
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

  console.log(`\nErstlogin vorbereiten für: ${email}\n`);

  let authUser = await findUserByEmail(admin, email);

  if (!authUser) {
    const tempPassword = crypto.randomUUID() + "Aa1!";
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
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
      email_confirm: true,
      user_metadata: {
        ...authUser.user_metadata,
        password_setup_required: true,
      },
    });
    if (error) {
      console.error("✗ Erstlogin-Modus konnte nicht gesetzt werden:", error.message);
      process.exit(1);
    }
    console.log("✓ Erstlogin-Modus aktiviert (Passwort in der App festlegen)");
  }

  const studioDb = admin.schema("studio_auth");
  const { data: existingStudio, error: findError } = await studioDb
    .from("users")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (findError) {
    const linked = await linkStudioUserViaSql(env, authUser.id, email);
    if (!linked) {
      console.error("✗ studio_auth nicht erreichbar:", findError.message);
      console.error("  → npm run db:migrate:studio");
      console.error("  → npm run studio:grant-admin -- --email", email);
      process.exit(1);
    }
  } else if (existingStudio) {
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
    console.log("✓ Studio-Zugang bestätigt (Super Admin)");
  } else {
    const { error: insertError } = await studioDb.from("users").insert({
      auth_user_id: authUser.id,
      email,
      role_id: "super_admin",
      is_active: true,
    });
    if (insertError) {
      const linked = await linkStudioUserViaSql(env, authUser.id, email);
      if (!linked) {
        console.error("✗ Studio-Nutzer Insert fehlgeschlagen:", insertError.message);
        process.exit(1);
      }
    } else {
      console.log("✓ Studio-Zugang angelegt (Super Admin)");
    }
  }

  console.log(`
Fertig. Jetzt in der App:

  ${appUrl(env)}/admin

E-Mail:   ${email}
Schritt:  Passwort festlegen & anmelden (Erstlogin)
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

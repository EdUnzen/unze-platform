#!/usr/bin/env node
/**
 * Fallback wenn studio_auth nicht in Supabase API exposed ist.
 * Usage: npm run studio:grant-admin -- --email support@unze.app
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

async function main() {
  const email = (getArg("--email") || process.env.STUDIO_ADMIN_EMAIL || "").trim();
  if (!email) {
    console.error("Usage: npm run studio:grant-admin -- --email deine@email.de");
    process.exit(1);
  }

  const env = { ...loadEnvLocal(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!url || !serviceKey || !password || !ref) {
    console.error("✗ .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_PASSWORD");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authUser = await findUserByEmail(admin, email);
  if (!authUser) {
    console.error(`✗ Kein Auth-Nutzer für ${email}. Zuerst: npm run studio:create-admin`);
    process.exit(1);
  }

  const conn = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const existing = await client.query(
    `SELECT id FROM studio_auth.users WHERE auth_user_id = $1`,
    [authUser.id],
  );

  if (existing.rows[0]) {
    await client.query(
      `UPDATE studio_auth.users SET email = $2, role_id = 'super_admin', is_active = true, updated_at = now() WHERE auth_user_id = $1`,
      [authUser.id, email],
    );
    console.log("✓ Studio-Zugang aktualisiert (Super Admin)");
  } else {
    await client.query(
      `INSERT INTO studio_auth.users (auth_user_id, email, role_id, is_active) VALUES ($1, $2, 'super_admin', true)`,
      [authUser.id, email],
    );
    console.log("✓ Studio-Zugang angelegt (Super Admin)");
  }

  await client.end();
  console.log(`\nFertig für ${email} — Login: ${(env.NEXT_PUBLIC_APP_URL || "http://localhost:3002").replace(/\/$/, "")}/admin\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

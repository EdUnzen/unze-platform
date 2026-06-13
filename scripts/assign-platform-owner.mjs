#!/usr/bin/env node
/**
 * Weist einem Profil die Plattform-Rolle owner zu (via Username, nicht E-Mail).
 * Usage: npm run assign:owner -- <username>
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = { ...process.env };
  for (const f of [join(root, ".env.local"), join(root, ".env.vercel")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (!env[k]) env[k] = t.slice(i + 1).trim();
    }
  }
  return env;
}

async function main() {
  const username = process.argv[2]?.trim().replace(/^@/, "");
  if (!username) {
    console.error("Usage: npm run assign:owner -- <username>");
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✗ SUPABASE URL/Service Role fehlt");
    process.exit(1);
  }

  const admin = createClient(url, key);
  const { data: profile, error: findErr } = await admin
    .from("profiles")
    .select("id, username, display_name, platform_role")
    .eq("username", username)
    .maybeSingle();

  if (findErr || !profile) {
    console.error(`✗ Profil nicht gefunden: @${username}`);
    process.exit(1);
  }

  const { error: updateErr } = await admin
    .from("profiles")
    .update({ platform_role: "owner" })
    .eq("id", profile.id);

  if (updateErr) {
    console.error("✗ Update fehlgeschlagen:", updateErr.message);
    process.exit(1);
  }

  console.log(`✓ Owner-Rolle gesetzt: ${profile.display_name ?? username} (@${username})`);
  console.log(`  Vorher: ${profile.platform_role} → owner`);
}

main();

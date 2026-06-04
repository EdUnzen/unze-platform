#!/usr/bin/env node
/**
 * Prüft Community-Create-Voraussetzungen (Migration 026, banner_url, Service Role).
 * Usage: npm run verify:community-create
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env.vercel"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      if (!env[t.slice(0, i).trim()]) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY nötig");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey);
  console.log("\n=== Community Create — Voraussetzungen ===\n");

  const cols = await admin.from("communities").select("banner_url, focus_tags").limit(1);
  console.log(cols.error ? `✗ communities Spalten: ${cols.error.message}` : "✓ banner_url + focus_tags");

  const testSlug = `test-verify-${Date.now()}`;
  const { data: user } = await admin.from("profiles").select("id").limit(1).maybeSingle();
  if (!user?.id) {
    console.log("◐ Kein Profil — Insert-Test übersprungen");
    return;
  }

  const { data: comm, error: cErr } = await admin
    .from("communities")
    .insert({
      slug: testSlug,
      title: "Verify Test",
      description: "auto",
      platform_type: "unze",
      category: "Gaming",
      tags: [],
      focus_tags: ["Test"],
      visibility: "public",
      banner_url:
        "https://images.unsplash.com/photo-1542751110-368ab147d270?auto=format&fit=crop&w=1200&q=80",
      banner_gradient: "from-violet-600/90 via-indigo-700/80 to-slate-900/75",
      creator_id: user.id,
      discover_enabled: true,
    })
    .select("id")
    .single();

  if (cErr) {
    console.log(`✗ Community-Insert: ${cErr.message}`);
    process.exit(1);
  }

  const { error: mErr } = await admin.from("community_members").insert({
    community_id: comm.id,
    user_id: user.id,
    role: "creator",
  });

  await admin.from("community_members").delete().eq("community_id", comm.id);
  await admin.from("communities").delete().eq("id", comm.id);

  if (mErr && !mErr.message.includes("duplicate")) {
    console.log(`✗ Creator-Member: ${mErr.message}`);
    process.exit(1);
  }

  console.log("✓ Admin-Insert Community + Creator-Member OK");
  console.log(
    env.SUPABASE_SERVICE_ROLE_KEY?.length > 50
      ? "✓ SUPABASE_SERVICE_ROLE_KEY gesetzt (Vercel-Fallback aktiv)"
      : "◐ SERVICE_ROLE_KEY fehlt — nur RLS 026 für User-Insert",
  );
  console.log("\n→ npm run db:migrate:026 falls Prod noch fehlschlägt\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

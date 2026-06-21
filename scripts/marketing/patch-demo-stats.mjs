#!/usr/bin/env node
/**
 * Setzt Marketing-Demo-Metriken und Community-Titel in Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { DEMO_STATS } from "./config.mjs";

const root = process.cwd();

function loadEnv() {
  const paths = [join(root, ".env.local"), join(root, ".env.vercel")];
  const env = {};
  for (const path of paths) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
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
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("Keine Supabase-Credentials - Demo-Stats uebersprungen.");
    return;
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  for (const [slug, stats] of Object.entries(DEMO_STATS)) {
    const payload = {
      member_count: stats.member_count,
      rating_avg: stats.rating_avg,
      review_count: stats.review_count,
      discover_score: Math.round(stats.member_count / 8),
      is_trending: stats.is_trending ?? stats.member_count > 3000,
    };
    if (stats.title) payload.title = stats.title;

    const { error } = await db.from("communities").update(payload).eq("slug", slug);

    if (error) {
      console.warn(`  Warnung ${slug}: ${error.message}`);
    } else {
      const name = stats.title ?? slug;
      console.log(`  \u2713 ${name}: ${stats.member_count.toLocaleString("de-DE")} Mitglieder`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

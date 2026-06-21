#!/usr/bin/env node
/**
 * Setzt realistische Marketing-Demo-Metriken in der Produktions-DB.
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
    console.log("Keine Supabase-Credentials \u2014 Demo-Stats \u00fcbersprungen.");
    return;
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  for (const [slug, stats] of Object.entries(DEMO_STATS)) {
    const { error } = await db
      .from("communities")
      .update({
        member_count: stats.member_count,
        rating_avg: stats.rating_avg,
        review_count: stats.review_count,
        discover_score: Math.round(stats.member_count / 10),
        is_trending: stats.member_count > 1500,
      })
      .eq("slug", slug);

    if (error) {
      console.warn(`  Warnung ${slug}: ${error.message}`);
    } else {
      console.log(`  \u2713 ${slug}: ${stats.member_count} Mitglieder, ${stats.rating_avg}\u2605`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

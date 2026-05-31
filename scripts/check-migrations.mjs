#!/usr/bin/env node
/**
 * Prüft ob Migrationen 021 und 022 in Supabase aktiv sind.
 * Usage: npm run check:migrations
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

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

async function checkTable(client, table, select = "id") {
  const { error } = await client.from(table).select(select).limit(1);
  return !error;
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL / ANON_KEY fehlen in .env.local\n");
    process.exit(1);
  }

  const client = createClient(url, key);
  console.log("\n=== UNZE Migration Check (021 + 022) ===\n");
  console.log(`Supabase: ${url}\n`);

  const core = await checkTable(client, "communities");
  console.log(core ? "✓ Kern-Schema (communities)" : "✗ Kern-Schema fehlt");

  const flagsTable = await checkTable(client, "platform_feature_flags", "key");
  console.log(
    flagsTable
      ? "✓ 021 — platform_feature_flags"
      : "✗ 021 — platform_feature_flags fehlt",
  );

  let feedFlag = false;
  if (flagsTable) {
    const { data, error } = await client
      .from("platform_feature_flags")
      .select("key, enabled")
      .eq("key", "feed_posts")
      .maybeSingle();
    feedFlag = !error && Boolean(data);
    console.log(
      feedFlag
        ? `✓ 021 — feed_posts Flag (enabled=${data?.enabled})`
        : "✗ 021 — feed_posts Flag fehlt",
    );
  }

  const events = await checkTable(client, "community_events");
  console.log(
    events ? "✓ 022 — community_events" : "✗ 022 — community_events fehlt",
  );

  const { error: groupTypeError } = await client
    .from("community_groups")
    .select("group_type")
    .limit(1);
  const groupType = !groupTypeError;
  console.log(
    groupType ? "✓ 022 — group_type Spalte" : "✗ 022 — group_type fehlt",
  );

  const communityReviews = await checkTable(client, "community_reviews");
  console.log(
    communityReviews
      ? "✓ 022 — community_reviews"
      : "✗ 022 — community_reviews fehlt",
  );

  const groupReviews = await checkTable(client, "group_reviews");
  console.log(
    groupReviews ? "✓ 022 — group_reviews" : "✗ 022 — group_reviews fehlt",
  );

  const ok021 = flagsTable && feedFlag;
  const ok022 = events && groupType && communityReviews && groupReviews;

  console.log("");
  if (core && ok021 && ok022) {
    console.log("✓ Alle Phase-1-Migrationen aktiv — Discover-Hinweis wird ausgeblendet.\n");
    process.exit(0);
  }

  console.error("✗ Migrationen unvollständig. In Supabase SQL Editor ausführen:\n");
  if (!ok021) console.error("  → database/migrations/021_platform_feature_flags.sql\n");
  if (!ok022) console.error("  → database/migrations/022_platform_core_entities.sql\n");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

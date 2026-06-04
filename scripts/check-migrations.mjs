#!/usr/bin/env node
/**
 * Prüft Migrationen 021, 022 und 024 in Supabase.
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
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL fehlt in .env.local\n");
    process.exit(1);
  }

  if (!serviceKey) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local\n");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey);

  console.log("\n=== UNZE Migration Check (021 + 022 + 024 + 025) ===\n");
  console.log(`Supabase: ${url}\n`);

  const core = await checkTable(admin, "communities");
  console.log(core ? "✓ Kern-Schema (communities)" : "✗ Kern-Schema fehlt");

  const flagsTable = await checkTable(admin, "platform_feature_flags", "key");
  console.log(
    flagsTable
      ? "✓ 021 — platform_feature_flags"
      : "✗ 021 — platform_feature_flags fehlt",
  );

  let feedFlag = false;
  if (flagsTable) {
    const { data, error } = await admin
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

  const events = await checkTable(admin, "community_events");
  console.log(
    events ? "✓ 022 — community_events" : "✗ 022 — community_events fehlt",
  );

  const { error: groupTypeError } = await admin
    .from("community_groups")
    .select("group_type")
    .limit(1);
  const groupType = !groupTypeError;
  console.log(
    groupType ? "✓ 022 — group_type Spalte" : "✗ 022 — group_type fehlt",
  );

  const communityReviews = await checkTable(admin, "community_reviews");
  console.log(
    communityReviews
      ? "✓ 022 — community_reviews"
      : "✗ 022 — community_reviews fehlt",
  );

  const groupReviews = await checkTable(admin, "group_reviews");
  console.log(
    groupReviews ? "✓ 022 — group_reviews" : "✗ 022 — group_reviews fehlt",
  );

  const payments = await checkTable(admin, "community_payments");
  console.log(
    payments ? "✓ 024 — community_payments" : "✗ 024 — community_payments fehlt",
  );

  const webhookEvents = await checkTable(admin, "stripe_webhook_events", "event_id");
  console.log(
    webhookEvents
      ? "✓ 024 — stripe_webhook_events"
      : "✗ 024 — stripe_webhook_events fehlt",
  );

  const { error: priceColError } = await admin
    .from("communities")
    .select("stripe_price_monthly_id, price_monthly_cents")
    .limit(1);
  console.log(
    !priceColError
      ? "✓ 024 — Community Stripe-Preis-Spalten"
      : "✗ 024 — stripe_price_* / price_* Spalten fehlen",
  );

  const { error: subColError } = await admin
    .from("subscriptions")
    .select("cancel_at_period_end, group_id")
    .limit(1);
  console.log(
    !subColError
      ? "✓ 024 — subscriptions (cancel_at_period_end, group_id)"
      : "✗ 024 — subscriptions-Spalten fehlen",
  );

  const { error: eventFollowError } = await admin
    .from("follows")
    .select("target_event_id")
    .limit(1);
  console.log(
    !eventFollowError
      ? "✓ 024 — follows.target_event_id"
      : "✗ 024 — Event-Favoriten-Spalte fehlt",
  );

  const levelCols = [
    "focus_tags",
    "community_level",
    "level_score",
    "show_member_area",
  ];
  let ok025 = true;
  for (const col of levelCols) {
    const { error } = await admin.from("communities").select(col).limit(1);
    const present = !error;
    if (!present) ok025 = false;
    console.log(
      present ? `✓ 025 — communities.${col}` : `✗ 025 — communities.${col} fehlt`,
    );
  }
  const { error: roleTitleError } = await admin
    .from("community_members")
    .select("role_title")
    .limit(1);
  const roleTitleOk = !roleTitleError;
  if (!roleTitleOk) ok025 = false;
  console.log(
    roleTitleOk
      ? "✓ 025 — community_members.role_title"
      : "✗ 025 — community_members.role_title fehlt",
  );

  const ok021 = flagsTable && feedFlag;
  const ok022 = events && groupType && communityReviews && groupReviews;
  const ok024 =
    payments &&
    webhookEvents &&
    !priceColError &&
    !subColError &&
    !eventFollowError;

  console.log("");
  if (core && ok021 && ok022 && ok024 && ok025) {
    console.log("✓ Alle Migrationen aktiv (021, 022, 024, 025).\n");
    process.exit(0);
  }

  console.error("✗ Migrationen unvollständig.\n");
  if (!ok021) console.error("  → database/migrations/021_platform_feature_flags.sql\n");
  if (!ok022) console.error("  → database/migrations/022_platform_core_entities.sql\n");
  if (!ok024) console.error("  → database/migrations/024_stripe_monetization_events.sql\n");
  if (!ok025) {
    console.error("  → database/migrations/025_community_level_focus.sql\n");
    console.error("  → npm run db:migrate:025  (nach SUPABASE_DB_PASSWORD in .env.local)\n");
  }
  console.error("  Oder: npm run db:migrate:021-024 (mit SUPABASE_DB_PASSWORD)\n");
  console.error("  Oder: database/migrations/BUNDLE_021_024.sql im SQL Editor\n");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

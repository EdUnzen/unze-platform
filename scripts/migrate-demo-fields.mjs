#!/usr/bin/env node
/**
 * Ergänzt Demo-Communities um neue Felder (Level, Fokus, role_title)
 * ohne Demo-Daten zu löschen.
 *
 * Usage: node scripts/migrate-demo-fields.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const DEMO_SLUGS = ["rocket-league-ssl", "business-circle-dach", "creator-lounge"];

const DEMO_META = {
  "rocket-league-ssl": {
    focus_tags: ["Coaching", "Analyse", "Turniere", "Community"],
    community_level: "diamond",
    level_score: 72,
    category: "Gaming",
    banner_url:
      "https://images.unsplash.com/photo-1542751110-368ab147d270?auto=format&fit=crop&w=1200&q=80",
  },
  "business-circle-dach": {
    focus_tags: ["Netzwerk", "Marketing", "Investments", "Events"],
    community_level: "platinum",
    level_score: 58,
    category: "Business",
    banner_url:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  "creator-lounge": {
    focus_tags: ["Community", "Collabs", "Events", "Netzwerk"],
    community_level: "gold",
    level_score: 46,
    category: "Kreativität",
    banner_url:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  },
};

const ROLE_TITLES = [
  { slug: "rocket-league-ssl", username: "maxssl", title: "SSL Coach" },
  { slug: "rocket-league-ssl", username: "sarahbiz", title: "Turnierleiter" },
  { slug: "business-circle-dach", username: "sarahbiz", title: "Community Manager" },
  { slug: "creator-lounge", username: "maxssl", title: "Support" },
];

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
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

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✗ Supabase URL + SUPABASE_SERVICE_ROLE_KEY erforderlich");
    process.exit(1);
  }

  const db = createClient(url, key);

  console.log("\n=== UNZE Demo-Felder migrieren (ohne Löschen) ===\n");

  for (const slug of DEMO_SLUGS) {
    const meta = DEMO_META[slug];
    const { error } = await db
      .from("communities")
      .update({
        focus_tags: meta.focus_tags,
        community_level: meta.community_level,
        level_score: meta.level_score,
        show_member_area: true,
        banner_url: meta.banner_url,
        category: meta.category,
      })
      .eq("slug", slug);

    if (error?.message?.includes("community_level")) {
      console.error("✗ Migration 025 fehlt — bitte zuerst ausführen");
      process.exit(1);
    }
    if (error) {
      console.error(`✗ ${slug}:`, error.message);
      continue;
    }
    console.log(`✓ Community aktualisiert: ${slug}`);
  }

  for (const row of ROLE_TITLES) {
    const { data: community } = await db
      .from("communities")
      .select("id")
      .eq("slug", row.slug)
      .maybeSingle();
    if (!community) continue;

    const { data: profile } = await db
      .from("profiles")
      .select("id")
      .eq("username", row.username)
      .maybeSingle();

    if (!profile) continue;

    const { error: memberErr } = await db
      .from("community_members")
      .update({ role_title: row.title })
      .eq("community_id", community.id)
      .eq("user_id", profile.id);

    if (memberErr?.message?.includes("role_title")) {
      console.error("✗ Migration 025 fehlt (role_title)");
      process.exit(1);
    }
    if (!memberErr) {
      console.log(`  ✓ ${row.slug} · @${row.username} → ${row.title}`);
    }
  }

  console.log("\nFertig. Demo-Daten wurden ergänzt, nicht gelöscht.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
/** Prüft Demo-Daten in Supabase (REST + optional Service Role). */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const DEMO_SLUGS = [
  "rocket-league-ssl",
  "business-circle-dach",
  "creator-lounge",
];
const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";

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

const TABLE_COUNT_SELECT = {
  post_likes: "post_id",
};

async function countTable(url, key, table) {
  const selectCol = TABLE_COUNT_SELECT[table] ?? "id";
  const res = await fetch(`${url}/rest/v1/${table}?select=${selectCol}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });
  const range = res.headers.get("content-range");
  const count = range ? range.split("/")[1] : null;
  return { table, status: res.status, count: count ?? "0" };
}

async function main() {
  console.log("\n=== UNZE Demo Data Verify ===\n");

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    console.error("✗ Supabase URL/Anon Key fehlt");
    process.exit(1);
  }

  const tables = [
    "profiles",
    "communities",
    "community_members",
    "community_groups",
    "community_join_questions",
    "community_join_applications",
    "posts",
    "comments",
    "post_likes",
    "notifications",
  ];

  console.log("--- Tabellen (Anon REST) ---\n");
  let schemaOk = true;
  for (const table of tables) {
    const r = await countTable(url, anonKey, table);
    const ok = r.status === 200 || r.status === 206;
    const note =
      table === "community_join_applications" && ok && r.count === "0"
        ? " (RLS: Anon sieht keine Bewerbungen — normal)"
        : "";
    console.log(`${ok ? "✓" : "✗"} ${table}: ${ok ? r.count + " Zeilen" : "HTTP " + r.status}${note}`);
    if (!ok) schemaOk = false;
  }

  if (!schemaOk) {
    console.log("\n→ Schema- oder Grant-Problem. Prüfe:");
    console.log("  database/BUNDLE_all_migrations.sql + database/FIX_api_grants.sql\n");
    process.exit(1);
  }

  const db = serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : createClient(url, anonKey);

  const { count: applicationCount } = serviceKey
    ? await db
        .from("community_join_applications")
        .select("*", { count: "exact", head: true })
    : { count: null };

  if (serviceKey && applicationCount != null) {
    console.log(`\n--- Bewerbungen (Service Role) ---\n`);
    console.log(`✓ community_join_applications: ${applicationCount} Zeilen`);
  }

  const { data: communities, error: commErr } = await db
    .from("communities")
    .select("slug, title, member_count, discover_enabled")
    .in("slug", DEMO_SLUGS);

  console.log("\n--- Demo-Communities ---\n");
  if (commErr) {
    console.error("✗", commErr.message);
  } else if (!communities?.length) {
    console.log("✗ Keine Demo-Communities — npm run seed:demo");
  } else {
    for (const c of communities) {
      console.log(`✓ ${c.slug} — ${c.title} (${c.member_count} Mitglieder, discover=${c.discover_enabled})`);
    }
    const missing = DEMO_SLUGS.filter(
      (s) => !communities.some((c) => c.slug === s),
    );
    if (missing.length) {
      console.log("✗ Fehlend:", missing.join(", "));
    }
  }

  const { count: postCount } = await db
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: likeCount } = await db
    .from("post_likes")
    .select("*", { count: "exact", head: true });

  const { count: commentCount } = await db
    .from("comments")
    .select("*", { count: "exact", head: true });

  const { count: memberCount } = await db
    .from("community_members")
    .select("*", { count: "exact", head: true });

  console.log("\n--- Aggregat ---\n");
  console.log(`Communities gesamt: ${communities?.length ?? 0} Demo / prüfe DB`);
  console.log(`Posts:              ${postCount ?? 0}`);
  console.log(`Likes:              ${likeCount ?? 0}`);
  console.log(`Comments:           ${commentCount ?? 0}`);
  console.log(`Members:            ${memberCount ?? 0}`);

  if (serviceKey) {
    const { data: users } = await db.auth.admin.listUsers({ perPage: 200 });
    const creator = users?.users?.find(
      (u) => u.email?.toLowerCase() === DEMO_CREATOR_EMAIL.toLowerCase(),
    );
    console.log("\n--- Demo-Account ---\n");
    if (creator) {
      console.log(`✓ ${DEMO_CREATOR_EMAIL}`);
      console.log(`  ID: ${creator.id}`);
      console.log(`  E-Mail bestätigt: ${creator.email_confirmed_at ? "ja" : "nein"}`);
    } else {
      console.log(`✗ ${DEMO_CREATOR_EMAIL} nicht gefunden — npm run seed:demo`);
    }
  } else {
    console.log("\n⚠ SUPABASE_SERVICE_ROLE_KEY fehlt — Auth-User-Check übersprungen");
  }

  const { data: publicPosts } = await db
    .from("posts")
    .select("id, title, visibility")
    .eq("visibility", "public")
    .limit(5);

  console.log("\n--- Feed (public posts) ---\n");
  if (!publicPosts?.length) {
    console.log("✗ Keine öffentlichen Posts im Feed");
  } else {
    for (const p of publicPosts) {
      console.log(`✓ ${p.title ?? "(ohne Titel)"}`);
    }
  }

  console.log("");
  const ok =
    (communities?.length ?? 0) >= 3 &&
    (postCount ?? 0) >= 6 &&
    (memberCount ?? 0) >= 3 &&
    (likeCount ?? 0) >= 1;

  if (ok) {
    console.log("Verify ERFOLGREICH — Discover & Feed sollten Daten zeigen.\n");
  } else {
    console.log("Verify UNVOLLSTÄNDIG — npm run setup:demo ausführen.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

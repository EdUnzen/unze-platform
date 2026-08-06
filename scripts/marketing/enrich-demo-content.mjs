#!/usr/bin/env node
/**
 * Erweitert Demo-Daten fuer Marketing: Seed, Stats, Mitglieder, Events.
 */
import { spawnSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { DEMO_STATS } from "./config.mjs";

const root = process.cwd();
const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";

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

async function ensureDemoMember(admin, db, { email, name, username }) {
  let user = await findUserByEmail(admin, email);
  if (!user) {
    try {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: "UnzeDemo2026!",
        email_confirm: true,
        user_metadata: { display_name: name },
      });
      if (error) {
        console.warn(`  Warnung User ${email}: ${error.message}`);
        return null;
      }
      user = data.user;
    } catch (err) {
      console.warn(`  Warnung User ${email}: ${err.message}`);
      return null;
    }
  }

  const { data: profile } = await db.from("profiles").select("unze_public_id").eq("id", user.id).maybeSingle();
  let publicId = profile?.unze_public_id;
  if (!publicId) {
    const { data: generated } = await db.rpc("generate_unze_public_id");
    publicId = generated;
  }

  await db.from("profiles").upsert(
    {
      id: user.id,
      display_name: name,
      username,
      bio: `${name} \u2014 UNZE Demo`,
      is_verified: false,
      unze_public_id: publicId,
    },
    { onConflict: "id" },
  );

  return user;
}

const EXTRA_MEMBERS = [
  { email: "rl.member01@unze.local", name: "Tim SSL", username: "timssl" },
  { email: "rl.member02@unze.local", name: "Nina Mechanic", username: "ninamech" },
  { email: "rl.member03@unze.local", name: "Felix Rotation", username: "felixrot" },
  { email: "rl.member04@unze.local", name: "Laura Aerial", username: "lauraaerial" },
  { email: "rl.member05@unze.local", name: "Jonas Diamond", username: "jonasd2" },
  { email: "rl.member06@unze.local", name: "Mia Boost", username: "miaboost" },
  { email: "rl.member07@unze.local", name: "Paul Flip", username: "paulflip" },
  { email: "rl.member08@unze.local", name: "Sara Defense", username: "saradef" },
  { email: "rl.member09@unze.local", name: "Ben Analyst", username: "benanalyst" },
  { email: "rl.member10@unze.local", name: "Emma Scrim", username: "emmascrim" },
  { email: "rl.member11@unze.local", name: "Luca Champ", username: "lucachamp" },
  { email: "rl.member12@unze.local", name: "Hannah Pro", username: "hannahpro" },
];

const ROLE_TITLES = ["SSL Coach", "Diamond", "Champion", "Analyst", "Scrim Lead", null];

async function enrichMembers(db, admin, communityId, creatorId) {
  const userIds = [creatorId];
  for (const def of EXTRA_MEMBERS) {
    const user = await ensureDemoMember(admin, db, def);
    if (user) userIds.push(user.id);
  }

  const baseMembers = ["demo.member1@unze.local", "demo.member2@unze.local", "demo.member3@unze.local"];
  for (const email of baseMembers) {
    const u = await findUserByEmail(admin, email);
    if (u) userIds.push(u.id);
  }

  if (userIds.length < 2) {
    console.warn("  Zu wenige Demo-Mitglieder \u2014 npm run seed:demo ausfuehren.");
    return;
  }

  let i = 0;
  for (const userId of [...new Set(userIds)]) {
    const role = userId === creatorId ? "creator" : i % 5 === 0 ? "moderator" : "member";
    const roleTitle = role === "member" ? ROLE_TITLES[i % ROLE_TITLES.length] : null;
    await db.from("community_members").upsert(
      {
        community_id: communityId,
        user_id: userId,
        role,
        role_title: roleTitle,
      },
      { onConflict: "community_id,user_id" },
    );
    i++;
  }

  const stats = DEMO_STATS["rocket-league-ssl"];
  await db
    .from("communities")
    .update({
      member_count: stats?.member_count ?? i,
      title: stats?.title ?? "Rocket League Deutschland",
      rating_avg: stats?.rating_avg ?? 4.9,
      review_count: stats?.review_count ?? 1847,
      is_trending: true,
    })
    .eq("id", communityId);

  console.log(`  \u2713 rocket-league-ssl: ${i} echte Mitglieder + Marketing-Metriken`);
}

async function enrichEvents(db, communityId, creatorId) {
  const now = Date.now();
  const events = [
    {
      slug: "ssl-scrim-night",
      title: "SSL Scrim Night",
      description: "Ranked Scrims mit Live-Feedback und Team-Matching.",
      starts_at: new Date(now + 4 * 86400000).toISOString(),
      location: "Discord Voice",
      is_featured: true,
    },
    {
      slug: "replay-review-live",
      title: "Replay Review Live",
      description: "Gemeinsame Analyse der Community-Replays.",
      starts_at: new Date(now + 9 * 86400000).toISOString(),
      location: "Online",
      is_featured: false,
    },
  ];

  for (const ev of events) {
    const { data: existing } = await db
      .from("community_events")
      .select("id")
      .eq("community_id", communityId)
      .eq("slug", ev.slug)
      .maybeSingle();

    const row = { ...ev, community_id: communityId, created_by: creatorId, is_public: true };
    if (existing) {
      await db.from("community_events").update(row).eq("id", existing.id);
    } else {
      await db.from("community_events").insert(row);
    }
  }
  console.log("  \u2713 Events fuer rocket-league-ssl");
}

async function enrichReviews(db, communityId, userIds) {
  const samples = [
    { rating: 5, title: "Bestes RL Coaching", body: "Klare Struktur, schnelle Fortschritte von Diamond zu Champ." },
    { rating: 5, title: "Starke Community", body: "Aktive Scrims und hilfreiche Replay-Sessions jeden Abend." },
    { rating: 4, title: "Top fuer Turniere", body: "Turniervorbereitung und Teamfindung funktionieren super." },
  ];

  for (let i = 0; i < samples.length && i < userIds.length; i++) {
    const s = samples[i];
    const { count } = await db
      .from("community_reviews")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId)
      .eq("user_id", userIds[i]);

    if ((count ?? 0) > 0) continue;

    await db.from("community_reviews").insert({
      community_id: communityId,
      user_id: userIds[i],
      rating: s.rating,
      title: s.title,
      body: s.body,
    });
  }
  console.log("  \u2713 Bewertungen ergaenzt");
}

async function main() {
  console.log("\n=== Demo-Daten anreichern ===\n");

  if (existsSync(join(root, ".env.local"))) {
    console.log("1. Marketing-Seed...");
    const r = spawnSync(process.execPath, ["scripts/seed-marketing-demo.mjs"], {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, UNZE_SKIP_BASE_SEED: "true" },
    });
    if (r.status !== 0) {
      console.warn("Marketing-Seed Warnung (exit " + r.status + ")");
    }

    console.log("\n2. Demo-Stats patchen...");
    spawnSync(process.execPath, ["scripts/marketing/patch-demo-stats.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
  } else {
    console.log("Keine .env.local \u2014 Seed uebersprungen.");
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("\nKeine Supabase-Credentials \u2014 Mitglieder-Enrichment uebersprungen.");
    return;
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const db = admin;

  const creator = await findUserByEmail(admin, DEMO_CREATOR_EMAIL);
  if (!creator) {
    console.warn("Demo-Creator nicht gefunden.");
    return;
  }

  const { data: community } = await db
    .from("communities")
    .select("id")
    .eq("slug", "rocket-league-ssl")
    .maybeSingle();

  if (!community) {
    console.warn("rocket-league-ssl nicht gefunden.");
    return;
  }

  console.log("\n3. Mitglieder, Events, Reviews...");
  await enrichMembers(db, admin, community.id, creator.id);

  const { data: members } = await db
    .from("community_members")
    .select("user_id")
    .eq("community_id", community.id)
    .limit(5);
  await enrichEvents(db, community.id, creator.id);
  await enrichReviews(db, community.id, (members ?? []).map((m) => m.user_id));

  console.log("\n\u2713 Demo-Anreicherung abgeschlossen\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

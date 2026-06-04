#!/usr/bin/env node
/**
 * UNZE Demo-Plattform Seed
 * Legt/aktualisiert 3 Demo-Communities, Gruppen, Feed, Mitglieder & Bewerbungen.
 *
 * Demo-Daten werden standardmäßig NICHT gelöscht — nur migriert/ergänzt.
 * Vollständiger Reset nur mit: UNZE_DEMO_FORCE_RESET=true npm run seed:demo
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Usage: npm run seed:demo
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { applyApiGrants } from "./apply-api-grants.mjs";

const root = process.cwd();
const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";
const DEMO_CREATOR_PASSWORD = "UnzeDemo2026!";
const DEMO_SLUGS = [
  "rocket-league-ssl",
  "business-circle-dach",
  "creator-lounge",
];

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

async function findUserByEmail(admin, email) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

async function ensureUser(admin, db, { email, password, displayName, username }) {
  let user = await findUserByEmail(admin, email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw new Error(`User ${email}: ${error.message}`);
    user = data.user;
    console.log(`  + User angelegt: ${email}`);
  } else if (!user.email_confirmed_at) {
    await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    console.log(`  ✓ E-Mail bestätigt: ${email}`);
  }

  await db.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      username,
      bio: displayName,
      is_creator: email === DEMO_CREATOR_EMAIL,
      is_verified: email === DEMO_CREATOR_EMAIL,
    },
    { onConflict: "id" },
  ).then(({ error }) => {
    if (error) throw new Error(`Profile ${email}: ${error.message}`);
  });

  if (email === DEMO_CREATOR_EMAIL) {
    const { error } = await db.from("creator_profiles").upsert(
      {
        user_id: user.id,
        headline: "UNZE Demo Creator — Gaming, Business & Entertainment",
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(`Creator profile ${email}: ${error.message}`);
  }

  return user;
}

async function deleteDemoBySlugs(db, slugs) {
  const { data: communities } = await db
    .from("communities")
    .select("id, slug")
    .in("slug", slugs);

  if (!communities?.length) return;

  const ids = communities.map((c) => c.id);
  await db.from("posts").delete().in("community_id", ids);
  await db.from("community_join_applications").delete().in("community_id", ids);
  await db.from("community_join_questions").delete().in("community_id", ids);
  await db.from("community_groups").delete().in("community_id", ids);
  await db.from("community_members").delete().in("community_id", ids);
  await db.from("communities").delete().in("id", ids);
  console.log(`  ↺ Demo-Communities entfernt (${slugs.join(", ")}) — nur mit UNZE_DEMO_FORCE_RESET`);
}

function communityPayload(creatorId, config) {
  return {
    slug: config.slug,
    title: config.title,
    description: config.description,
    banner_gradient: config.bannerGradient,
    platform_type: config.platformType,
    category: config.category,
    tags: config.tags,
    focus_tags: config.focusTags ?? [],
    community_level: config.communityLevel ?? "gold",
    level_score: config.levelScore ?? 50,
    show_member_area: true,
    visibility: "public",
    creator_id: creatorId,
    is_verified: config.isVerified ?? true,
    is_trending: config.isTrending ?? true,
    discover_enabled: true,
    discover_score: config.discoverScore ?? 100,
    rating_avg: config.rating ?? 0,
    review_count: config.reviews ?? 0,
    external_url: config.externalUrl ?? null,
    join_approval_mode: config.joinApprovalMode ?? "auto_accept",
    access_status: "open",
    community_rules: config.rules ?? null,
    require_rules_consent: Boolean(config.rules),
    waitlist_enabled: config.waitlistEnabled ?? false,
    admissions_paused: false,
  };
}

async function ensureDemoCommunity(db, creatorId, config) {
  const { data: existing } = await db
    .from("communities")
    .select("id, slug")
    .eq("slug", config.slug)
    .maybeSingle();

  const payload = communityPayload(creatorId, config);

  if (existing) {
    const { data, error } = await db
      .from("communities")
      .update(payload)
      .eq("id", existing.id)
      .select("id, slug")
      .single();
    if (error) throw new Error(`Community Update ${config.slug}: ${error.message}`);
    console.log(`  ✓ Demo-Community aktualisiert: ${config.slug}`);
    return data;
  }

  const { data, error } = await db
    .from("communities")
    .insert({ ...payload, member_count: 0 })
    .select("id, slug")
    .single();

  if (error) throw new Error(`Community ${config.slug}: ${error.message}`);
  console.log(`  + Demo-Community angelegt: ${config.slug}`);
  return data;
}

async function ensureGroup(db, communityId, g, sortOrder, extra = {}) {
  const { data: existing } = await db
    .from("community_groups")
    .select("id")
    .eq("community_id", communityId)
    .eq("slug", g.slug)
    .maybeSingle();

  const row = {
    community_id: communityId,
    slug: g.slug,
    title: g.title,
    description: g.description,
    sort_order: sortOrder,
    is_public: true,
    group_type: extra.groupType ?? "group",
    price_cents: extra.priceCents ?? null,
    currency: extra.currency ?? "eur",
    rating_avg: extra.rating ?? 0,
    review_count: extra.reviews ?? 0,
  };

  if (existing) {
    await db.from("community_groups").update(row).eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await db
    .from("community_groups")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(`Gruppe ${g.slug}: ${error.message}`);
  return data.id;
}

async function communityHasPosts(db, communityId) {
  const { count } = await db
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);
  return (count ?? 0) > 0;
}

async function addMember(db, communityId, userId, role = "member", roleTitle = null) {
  const { error } = await db.from("community_members").upsert(
    {
      community_id: communityId,
      user_id: userId,
      role,
      role_title: roleTitle,
    },
    { onConflict: "community_id,user_id" },
  );
  if (error) throw error;
}

async function syncMemberCount(db, communityId) {
  const { count } = await db
    .from("community_members")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId);
  await db
    .from("communities")
    .update({ member_count: count ?? 0 })
    .eq("id", communityId);
}

async function probeApiAccess(db) {
  const { error } = await db.from("communities").select("id").limit(1);
  return error?.message?.includes("permission denied") ?? false;
}

function createServiceRoleClient(url, serviceKey) {
  const keyLabel = serviceKey.startsWith("sb_secret_")
    ? "sb_secret (Secret Key)"
    : serviceKey.startsWith("eyJ")
      ? "JWT service_role"
      : "WARN: unbekanntes Key-Format";

  const client = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    },
  });

  return { client, keyLabel };
}

async function main() {
  console.log("\n=== UNZE Demo Seed ===\n");

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY erforderlich.");
    console.error("  Supabase → Settings → API → Secret key (sb_secret_...) oder service_role JWT\n");
    process.exit(1);
  }

  const { client: admin, keyLabel } = createServiceRoleClient(url, serviceKey);
  const db = admin;
  console.log(`→ Client: ${keyLabel} (nicht Anon Key)\n`);

  if (await probeApiAccess(db)) {
    console.log("⚠ permission denied — wende API-Grants an …");
    const grants = await applyApiGrants(env);
    if (!grants.ok) {
      console.error("\n✗ Tabellen-Grants fehlen (Supabase 42501).");
      console.error("  Einmalig im SQL Editor ausführen:");
      console.error("  → database/FIX_api_grants.sql");
      console.error("  Oder: SUPABASE_DB_PASSWORD in .env.local + npm run db:grants\n");
      process.exit(1);
    }
    console.log("✓ API-Grants via Postgres angewendet\n");
    if (await probeApiAccess(db)) {
      console.error("✗ Grants angewendet, aber Zugriff weiterhin blockiert.");
      console.error("  Schema-Cache neu laden: Supabase → Settings → API → Reload\n");
      process.exit(1);
    }
  }

  console.log("1. Demo-Accounts vorbereiten…");
  const creator = await ensureUser(admin, db, {
    email: DEMO_CREATOR_EMAIL,
    password: DEMO_CREATOR_PASSWORD,
    displayName: "Edu UNZE Demo",
    username: "edudemo",
  });

  const members = [];
  const memberDefs = [
    { email: "demo.member1@unze.local", name: "Max SSL", username: "maxssl" },
    { email: "demo.member2@unze.local", name: "Sarah Business", username: "sarahbiz" },
    { email: "demo.member3@unze.local", name: "Leo Creator", username: "leocreator" },
    { email: "demo.applicant@unze.local", name: "Alex Bewerber", username: "alexbew" },
  ];

  for (const m of memberDefs) {
    members.push(
      await ensureUser(admin, db, {
        email: m.email,
        password: "UnzeDemo2026!",
        displayName: m.name,
        username: m.username,
      }),
    );
  }

  console.log("\n2. Demo-Communities (beibehalten & aktualisieren)…");
  if (process.env.UNZE_DEMO_FORCE_RESET === "true") {
    console.log("  ⚠ UNZE_DEMO_FORCE_RESET=true — löscht Demo-Daten vor Neuaufbau");
    await deleteDemoBySlugs(db, DEMO_SLUGS);
  } else {
    console.log("  → Bestehende Demo-Daten bleiben erhalten (nur Update/Ergänzung)");
  }

  const gaming = await ensureDemoCommunity(db, creator.id, {
    slug: "rocket-league-ssl",
    title: "Rocket League SSL Coaching",
    description:
      "Elite Coaching für Rocket League — von Diamond bis SSL. Taktik, Mechaniken, Replay-Reviews und Turniervorbereitung. Discord-Community mit wöchentlichen Live-Sessions.",
    bannerGradient: "from-orange-500/90 via-red-600/80 to-purple-900/70",
    platformType: "discord",
    category: "Gaming",
    tags: ["Rocket League", "SSL", "Coaching", "Esports"],
    externalUrl: "https://discord.com",
    joinApprovalMode: "manual_review",
    waitlistEnabled: true,
    discoverScore: 220,
    rules:
      "Respektvoller Umgang · Kein Boosting-Verkauf · Replays nur in Coaching-Kanal · Mindest-Rang Diamond 2",
    focusTags: ["Coaching", "Analyse", "Turniere", "Community"],
    communityLevel: "diamond",
    levelScore: 72,
    rating: 4.9,
    reviews: 84,
  });

  const business = await ensureDemoCommunity(db, creator.id, {
    slug: "business-circle-dach",
    title: "Business Circle DACH",
    description:
      "Netzwerk für Unternehmer, Marketer und Gründer im DACH-Raum. Austausch zu Skalierung, Paid Ads, Branding und Partnerschaften. Monatliche Masterminds & Service-Börse.",
    bannerGradient: "from-slate-700/90 via-blue-800/80 to-indigo-900/70",
    platformType: "unze",
    category: "Business",
    tags: ["Networking", "Marketing", "Unternehmer", "DACH"],
    joinApprovalMode: "manual_review",
    discoverScore: 200,
    rules: "Kein Spam · Services klar kennzeichnen · Vertraulichkeit in Masterminds",
    focusTags: ["Netzwerk", "Marketing", "Investments", "Events"],
    communityLevel: "platinum",
    levelScore: 58,
    rating: 4.7,
    reviews: 42,
  });

  const entertainment = await ensureDemoCommunity(db, creator.id, {
    slug: "creator-lounge",
    title: "Creator Lounge",
    description:
      "Social Hub für Creator aller Größen. Feed, Trends, Collabs und Community-Events. Teile Clips, gewinne Feedback und wachse mit anderen Creators.",
    bannerGradient: "from-pink-500/90 via-fuchsia-600/80 to-violet-800/70",
    platformType: "unze",
    category: "Entertainment",
    tags: ["Creator", "Social", "Content", "Collab"],
    joinApprovalMode: "auto_accept",
    discoverScore: 190,
    focusTags: ["Community", "Collabs", "Events", "Netzwerk"],
    communityLevel: "gold",
    levelScore: 46,
    rating: 4.8,
    reviews: 156,
  });

  const communities = [
    { row: gaming, key: "gaming" },
    { row: business, key: "business" },
    { row: entertainment, key: "entertainment" },
  ];

  console.log("\n3. Gruppen, Fragen & Mitglieder…");

  const groups = {
    gaming: [
      { slug: "coaching", title: "SSL Coaching", description: "1:1 und Gruppen-Coaching" },
      { slug: "clips", title: "Clips & Highlights", description: "Deine besten Plays" },
      { slug: "turniere", title: "Turniere", description: "Events & Scrims" },
      {
        slug: "einzelcoaching",
        title: "Einzelcoaching 1v1",
        description: "60 Min Replay-Review",
        groupType: "service",
        priceCents: 5000,
        rating: 5,
        reviews: 28,
      },
    ],
    business: [
      { slug: "networking", title: "Networking", description: "Kontakte & Intros" },
      { slug: "marketing", title: "Marketing", description: "Ads, Funnel, Brand" },
      {
        slug: "services",
        title: "Meta Ads Audit",
        description: "30-Min-Audit für E-Commerce",
        groupType: "service",
        priceCents: 9900,
        rating: 4.8,
        reviews: 15,
      },
    ],
    entertainment: [
      { slug: "feed", title: "Creator Feed", description: "Ankündigungen & News" },
      { slug: "collabs", title: "Collabs", description: "Gemeinsame Projekte" },
    ],
  };

  for (const { row, key } of communities) {
    for (const [i, g] of groups[key].entries()) {
      await ensureGroup(db, row.id, g, i, {
        groupType: g.groupType,
        priceCents: g.priceCents,
        rating: g.rating,
        reviews: g.reviews,
      });
    }
  }

  const gamingQuestions = [
    {
      label: "Aktueller Rocket-League-Rang?",
      placeholder: "z. B. Champ 2 / SSL",
      question_type: "text",
      is_required: true,
      sort_order: 0,
    },
    {
      label: "Wöchentliche Spielstunden?",
      placeholder: "z. B. 10–15h",
      question_type: "text",
      is_required: true,
      sort_order: 1,
    },
    {
      label: "Discord-Tag für Coaching",
      placeholder: "name#1234",
      question_type: "text",
      is_required: true,
      sort_order: 2,
    },
    {
      label: "Ich akzeptiere die Community-Regeln",
      question_type: "rules_consent",
      is_required: true,
      sort_order: 3,
    },
  ];

  const { count: gqCount } = await db
    .from("community_join_questions")
    .select("*", { count: "exact", head: true })
    .eq("community_id", gaming.id);

  if ((gqCount ?? 0) === 0) {
    for (const q of gamingQuestions) {
      await db.from("community_join_questions").insert({
        community_id: gaming.id,
        ...q,
      });
    }
  }

  const businessQuestions = [
    {
      label: "Branche / Fokus",
      placeholder: "z. B. E-Commerce, Agentur",
      question_type: "text",
      is_required: true,
      sort_order: 0,
    },
    {
      label: "Was bietest du dem Netzwerk?",
      question_type: "text",
      is_required: true,
      sort_order: 1,
    },
  ];

  const { count: bqCount } = await db
    .from("community_join_questions")
    .select("*", { count: "exact", head: true })
    .eq("community_id", business.id);

  if ((bqCount ?? 0) === 0) {
    for (const q of businessQuestions) {
      await db.from("community_join_questions").insert({
        community_id: business.id,
        ...q,
      });
    }
  }

  await addMember(db, gaming.id, creator.id, "creator");
  await addMember(db, business.id, creator.id, "creator");
  await addMember(db, entertainment.id, creator.id, "creator");

  await addMember(db, gaming.id, members[0].id, "moderator", "SSL Coach");
  await addMember(db, gaming.id, members[1].id, "expert", "Turnierleiter");
  await addMember(db, gaming.id, members[2].id, "verified_member", "VIP");
  await addMember(db, business.id, members[1].id, "admin", "Community Manager");
  await addMember(db, business.id, members[2].id, "member");
  await addMember(db, entertainment.id, members[2].id, "member");
  await addMember(db, entertainment.id, members[0].id, "moderator", "Support");

  for (const { row } of communities) {
    await syncMemberCount(db, row.id);
  }

  console.log("\n3b. Engagement-Metriken (Aufrufe & Shares)…");

  const communityEngagement = {
    gaming: {
      view_count_total: 98_500,
      view_count_weekly: 12_400,
      share_count: 340,
    },
    business: {
      view_count_total: 64_200,
      view_count_weekly: 8_900,
      share_count: 210,
    },
    entertainment: {
      view_count_total: 156_000,
      view_count_weekly: 24_600,
      share_count: 520,
    },
  };

  for (const { row, key } of communities) {
    const metrics = communityEngagement[key];
    if (!metrics) continue;
    const { error } = await db
      .from("communities")
      .update(metrics)
      .eq("id", row.id);
    if (error?.message?.includes("view_count")) {
      console.log("  ⚠ Engagement-Spalten fehlen — Migration 016 ausführen");
      break;
    }
  }

  const groupEngagementBySlug = {
    coaching: { view_count_weekly: 4_200, share_count: 89 },
    clips: { view_count_weekly: 6_800, share_count: 142 },
    networking: { view_count_weekly: 3_100, share_count: 76 },
    feed: { view_count_weekly: 9_400, share_count: 198 },
  };

  const communityIds = communities.map((c) => c.row.id);
  const { data: groupRows } = await db
    .from("community_groups")
    .select("id, slug")
    .in("community_id", communityIds);

  for (const group of groupRows ?? []) {
    const metrics = groupEngagementBySlug[group.slug];
    if (!metrics) continue;
    await db.from("community_groups").update(metrics).eq("id", group.id);
  }

  console.log("\n4. Feed-Posts, Likes & Kommentare…");

  const seedPosts =
    !(await communityHasPosts(db, gaming.id)) ||
    !(await communityHasPosts(db, business.id)) ||
    !(await communityHasPosts(db, entertainment.id));

  if (!seedPosts) {
    console.log("  → Feed-Posts bereits vorhanden — übersprungen (Demo-Inhalt bleibt)");
  }

  async function groupId(communityId, slug) {
    const { data } = await db
      .from("community_groups")
      .select("id")
      .eq("community_id", communityId)
      .eq("slug", slug)
      .maybeSingle();
    return data?.id ?? null;
  }

  const gamingGroups = {
    coaching: await groupId(gaming.id, "coaching"),
    clips: await groupId(gaming.id, "clips"),
    turniere: await groupId(gaming.id, "turniere"),
  };
  const businessGroups = {
    networking: await groupId(business.id, "networking"),
    marketing: await groupId(business.id, "marketing"),
  };
  const entertainmentGroups = {
    feed: await groupId(entertainment.id, "feed"),
    collabs: await groupId(entertainment.id, "collabs"),
  };

  const img = (id, w = 800) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

  const posts = [
    {
      communityId: gaming.id,
      groupId: gamingGroups.coaching,
      authorId: creator.id,
      title: "Neue SSL-Trainingsroutine",
      content:
        "Diese Woche: Air-Dribble-Konsistenz + Defensive Rotation. Wer Replay-Analyse will, droppt ein 2v2-Replay im Coaching-Kanal.",
      post_type: "community_update",
      visibility: "public",
      is_pinned: true,
      like_count: 42,
      comment_count: 2,
      view_count: 1240,
      share_count: 18,
    },
    {
      communityId: gaming.id,
      groupId: gamingGroups.clips,
      authorId: members[0].id,
      title: "Clip der Woche — Double Tap Goal",
      content: "Double tap → ceiling → pre-flip goal. Endlich SSL-Touchdown! 🚀",
      post_type: "clip",
      visibility: "public",
      like_count: 128,
      comment_count: 1,
      view_count: 3420,
      share_count: 56,
      metadata: {
        externalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        externalPlatform: "youtube",
        contentSource: "external_embed",
      },
    },
    {
      communityId: gaming.id,
      groupId: gamingGroups.turniere,
      authorId: members[1].id,
      title: "Suche 2v2 Mate — heute Abend",
      content:
        "Diamond 2+, Voice required. Scrims ab 20:00 — meldet euch im Turniere-Kanal.",
      post_type: "request",
      visibility: "public",
      like_count: 22,
      comment_count: 3,
      view_count: 890,
      share_count: 12,
    },
    {
      communityId: gaming.id,
      groupId: gamingGroups.turniere,
      authorId: members[0].id,
      title: "Scrims Samstag — Bilder & Setup",
      content: "3v3 Custom Lobby — SSL only. So sah's letzte Woche aus 👇",
      post_type: "gallery",
      visibility: "public",
      like_count: 31,
      comment_count: 0,
      view_count: 2100,
      share_count: 24,
      media: [
        { type: "image", url: img("1511512578047-dfb367046420"), alt: "Scrims Lobby" },
        { type: "image", url: img("1493711662062-fa541adb3fc8"), alt: "Turnier Setup" },
        { type: "image", url: img("1552820728-8b831bb1ebd2"), alt: "Team Highlight" },
      ],
    },
    {
      communityId: business.id,
      authorId: creator.id,
      title: "Mastermind: Q2 Skalierung",
      content:
        "Nächsten Donnerstag 19:00 — Thema Paid Social + Offer-Stacking. Bringt eure KPIs mit (CAC, LTV, ROAS).",
      post_type: "event",
      visibility: "public",
      is_pinned: true,
      like_count: 35,
      comment_count: 1,
      view_count: 760,
      share_count: 9,
      metadata: {
        eventAt: new Date(Date.now() + 3 * 86400000).toISOString(),
        location: "UNZE Voice + Networking-Gruppe",
      },
      media: [{ type: "image", url: img("1556761175-5973dc0f32e7"), alt: "Mastermind" }],
    },
    {
      communityId: business.id,
      groupId: businessGroups.marketing,
      authorId: members[1].id,
      title: "Service-Angebot: Meta Ads Audit",
      content:
        "Biete kostenloses 30-Min-Audit für DACH-E-Commerce (Umsatz 50k+). DM oder Antwort hier.",
      post_type: "text",
      visibility: "public",
      like_count: 19,
      comment_count: 0,
      view_count: 420,
      share_count: 5,
    },
    {
      communityId: entertainment.id,
      groupId: entertainmentGroups.collabs,
      authorId: members[2].id,
      title: "Collab gesucht: Podcast-Gäste",
      content:
        "Creator mit 5k+ Followern für Cross-Promo — Thema Lifestyle & Tech. Wer Bock hat?",
      post_type: "request",
      visibility: "public",
      like_count: 56,
      comment_count: 2,
      view_count: 1580,
      share_count: 31,
    },
    {
      communityId: entertainment.id,
      authorId: creator.id,
      title: "Willkommen in der Creator Lounge",
      content:
        "Postet eure besten Clips, gebt Feedback und voted die Highlights der Woche hoch. Let's grow together.",
      post_type: "community_update",
      visibility: "public",
      is_pinned: true,
      like_count: 88,
      comment_count: 1,
      view_count: 4200,
      share_count: 67,
    },
    {
      communityId: entertainment.id,
      groupId: entertainmentGroups.feed,
      authorId: members[0].id,
      title: "Highlight der Woche — Creator Montage",
      content: "Cross-Post aus Gaming — wer will collab für einen Creator-Montage-Stream?",
      post_type: "highlight",
      visibility: "public",
      like_count: 47,
      comment_count: 0,
      view_count: 2890,
      share_count: 44,
      media: [
        {
          type: "image",
          url: img("1611162617474-5b21e939e113"),
          alt: "Creator Highlight",
        },
      ],
    },
    {
      communityId: gaming.id,
      groupId: gamingGroups.coaching,
      authorId: creator.id,
      title: "Replay-Analyse: Champ 3 → SSL",
      content:
        "Wer heute Abend 20:00 Zeit hat — ich stream die Analyse live im Coaching-Kanal. Bringt 1 Replay mit.",
      post_type: "event",
      visibility: "public",
      like_count: 31,
      comment_count: 0,
      view_count: 650,
      share_count: 8,
      metadata: {
        eventAt: new Date(Date.now() + 86400000).toISOString(),
        location: "Discord Coaching Voice",
      },
    },
  ];

  const insertedPosts = [];
  if (seedPosts) for (const p of posts) {
    const row = {
      author_id: p.authorId,
      community_id: p.communityId,
      group_id: p.groupId ?? null,
      title: p.title,
      content: p.content,
      post_type: p.post_type,
      visibility: p.visibility,
      is_pinned: p.is_pinned ?? false,
      like_count: p.like_count,
      comment_count: p.comment_count,
      view_count: p.view_count ?? 0,
      share_count: p.share_count ?? 0,
      media: p.media ?? [],
      metadata: p.metadata ?? {},
    };
    const { data, error } = await db.from("posts").insert(row).select("id").single();
    if (error) {
      const { group_id, media, metadata, view_count, share_count, ...legacy } = row;
      const fallback = await db
        .from("posts")
        .insert(legacy)
        .select("id")
        .single();
      if (fallback.error) throw fallback.error;
      insertedPosts.push({ ...p, id: fallback.data.id });
    } else {
      insertedPosts.push({ ...p, id: data.id });
    }
  }

  if (seedPosts) for (const post of insertedPosts) {
    await db.from("post_likes").upsert(
      { post_id: post.id, user_id: creator.id },
      { onConflict: "post_id,user_id" },
    );
    if (post.authorId !== creator.id) {
      await db.from("post_likes").upsert(
        { post_id: post.id, user_id: members[2].id },
        { onConflict: "post_id,user_id" },
      );
    }
  }

  const comments = [
    {
      postIdx: 0,
      authorId: members[0].id,
      content: "Bin dabei — schick dir gleich mein letztes 2v2.",
    },
    {
      postIdx: 0,
      authorId: members[1].id,
      content: "Rotation-Drills wären mega für Champ 3.",
    },
    {
      postIdx: 1,
      authorId: creator.id,
      content: "Stark! Nächste Session: Consistency under pressure.",
    },
    {
      postIdx: 2,
      authorId: members[1].id,
      content: "Ich bringe Case Study mit 3.2x ROAS.",
    },
    {
      postIdx: 4,
      authorId: creator.id,
      content: "Melde dich — passt perfekt für Episode 12.",
    },
    {
      postIdx: 4,
      authorId: members[0].id,
      content: "Ich hätte auch Interesse an Gaming-Crossover.",
    },
    {
      postIdx: 5,
      authorId: members[2].id,
      content: "Erster Clip ist oben — freue mich auf Feedback!",
    },
  ];

  if (seedPosts) {
    for (const c of comments) {
      const post = insertedPosts[c.postIdx];
      if (!post) continue;
      await db.from("comments").insert({
        post_id: post.id,
        author_id: c.authorId,
        content: c.content,
      });
    }
  }

  console.log("\n5. Bewerbung für Creator-Dashboard…");

  const { data: existingApp } = await db
    .from("community_join_applications")
    .select("id")
    .eq("community_id", gaming.id)
    .eq("user_id", members[3].id)
    .maybeSingle();

  if (!existingApp) {
    const { data: app } = await db
      .from("community_join_applications")
      .insert({
        community_id: gaming.id,
        user_id: members[3].id,
        status: "pending",
        system_message: "Demo-Bewerbung für Dashboard-Test",
      })
      .select("id")
      .single();

    const { data: questions } = await db
      .from("community_join_questions")
      .select("id, sort_order")
      .eq("community_id", gaming.id)
      .order("sort_order");

    const answers = [
      "Champ 3",
      "12h pro Woche",
      "alexbew#0001",
      true,
    ];

    for (const [i, q] of (questions ?? []).entries()) {
      const val = answers[i];
      await db.from("community_join_application_answers").insert({
        application_id: app.id,
        question_id: q.id,
        value_text: typeof val === "string" ? val : null,
        value_boolean: typeof val === "boolean" ? val : null,
      });
    }

    await db.from("community_join_platform_identities").insert({
      application_id: app.id,
      platform_type: "discord",
      value: "alexbew#0001",
    });

    await db.from("notifications").insert({
      user_id: creator.id,
      type: "application",
      title: "Neue Bewerbung: Rocket League SSL Coaching",
      body: "Alex Bewerber möchte der Community beitreten.",
      data: {
        category: "application",
        communitySlug: "rocket-league-ssl",
        communityId: gaming.id,
      },
    });
  }

  console.log("\n6. Badges & Auszeichnungen…");

  const demoBadges = [
    {
      communityId: gaming.id,
      name: "SSL Scholar",
      description: "Aktives Coaching-Mitglied",
      badgeType: "permanent",
      grantTo: [members[0].id],
    },
    {
      communityId: gaming.id,
      name: "Clip Master",
      description: "Top-Clip der Woche",
      badgeType: "event",
      grantTo: [members[1].id],
    },
    {
      communityId: business.id,
      name: "DACH Connector",
      description: "Aktives Networking",
      badgeType: "permanent",
      grantTo: [members[1].id, members[2].id],
    },
    {
      communityId: entertainment.id,
      name: "Trending Creator",
      description: "Hohes Engagement im Feed",
      badgeType: "temporary",
      grantTo: [members[2].id],
    },
  ];

  console.log("\n3. Referral & Revenue Sandbox…");
  try {
  await db
    .from("profiles")
    .update({ is_creator: true })
    .eq("id", members[2].id);

  await db.from("creator_profiles").upsert(
    {
      user_id: members[2].id,
      headline: "Demo Creator — geworben über UNZE Referral",
    },
    { onConflict: "user_id" },
  );

  await db.from("creator_referrals").upsert(
    {
      referred_user_id: members[2].id,
      referrer_user_id: creator.id,
      status: "active",
    },
    { onConflict: "referred_user_id" },
  );

  const grossCents = 1999;
  const stripeFee = Math.round(grossCents * 0.029 + 30);
  const afterStripe = grossCents - stripeFee;
  const platformFee = Math.round(afterStripe * 0.077);
  const netPlatform = afterStripe - platformFee;
  const referrerShare = Math.round(netPlatform * 0.11);

  await db.from("revenue_share_ledger").insert({
    community_id: gaming.id,
    creator_user_id: creator.id,
    referrer_user_id: null,
    gross_amount_cents: grossCents,
    platform_fee_cents: platformFee,
    net_platform_cents: netPlatform,
    referrer_share_cents: 0,
    ledger_status: "sandbox",
    metadata: { seed: "demo-creator-sale" },
  });

  await db.from("revenue_share_ledger").insert({
    community_id: entertainment.id,
    creator_user_id: members[2].id,
    referrer_user_id: creator.id,
    gross_amount_cents: 999,
    platform_fee_cents: (() => {
      const g = 999;
      const s = Math.round(g * 0.029 + 30);
      return Math.round((g - s) * 0.077);
    })(),
    net_platform_cents: (() => {
      const g = 999;
      const s = Math.round(g * 0.029 + 30);
      const p = Math.round((g - s) * 0.077);
      return g - s - p;
    })(),
    referrer_share_cents: (() => {
      const g = 999;
      const s = Math.round(g * 0.029 + 30);
      const p = Math.round((g - s) * 0.077);
      const n = g - s - p;
      return Math.round(n * 0.11);
    })(),
    ledger_status: "sandbox",
    metadata: { seed: "demo-referral-share" },
  });
  } catch (err) {
    console.warn(
      "  ⚠ Referral/Revenue Seed übersprungen — Migration 019 anwenden:",
      err.message,
    );
  }

  for (const def of demoBadges) {
    const { data: badge, error: badgeError } = await db
      .from("badges")
      .insert({
        community_id: def.communityId,
        name: def.name,
        description: def.description,
        badge_type: def.badgeType,
      })
      .select("id")
      .single();

    if (badgeError) throw new Error(`Badge ${def.name}: ${badgeError.message}`);

    for (const userId of def.grantTo) {
      await db.from("user_badges").upsert(
        {
          user_id: userId,
          badge_id: badge.id,
          community_id: def.communityId,
          granted_by: creator.id,
        },
        { onConflict: "user_id,badge_id" },
      );
    }
  }

  console.log("\n=== Demo Seed ERFOLGREICH ===\n");
  console.log("Creator-Login:");
  console.log(`  E-Mail:    ${DEMO_CREATOR_EMAIL}`);
  console.log(`  Passwort:  ${DEMO_CREATOR_PASSWORD}`);
  console.log("\nCommunities:");
  for (const slug of DEMO_SLUGS) {
    console.log(`  http://localhost:3002/community/${slug}`);
  }
  console.log("\nDashboard:");
  console.log("  http://localhost:3002/dashboard");
  console.log("  http://localhost:3002/dashboard/referrals");
  console.log("  http://localhost:3002/dashboard/community/rocket-league-ssl/requests");
  console.log("\nDiscover: http://localhost:3002/discover\n");
}

main().catch((err) => {
  console.error("\n✗ Seed fehlgeschlagen:", err.message);
  process.exit(1);
});

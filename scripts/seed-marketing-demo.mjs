#!/usr/bin/env node
/**
 * Marketing-Demo Seed � erweitert seed:demo um 6 Vertical-Communities.
 * Usage: npm run seed:marketing
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Optional: UNZE_SKIP_BASE_SEED=true (nur Marketing-Communities)
 */
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  MARKETING_COMMUNITIES,
  MARKETING_GROUPS_BY_SLUG,
} from "./data/marketing-communities.mjs";

const root = process.cwd();
const DEMO_CREATOR_EMAIL = "edubek89@icloud.com";

function loadEnvLocal() {
  const paths = [join(root, ".env.local"), join(root, ".env.vercel")];
  const env = {};
  for (const path of paths) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      if (!env[key]) env[key] = trimmed.slice(idx + 1).trim();
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

async function ensureCommunity(db, creatorId, config) {
  const payload = {
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
    is_verified: true,
    is_trending: config.isTrending ?? false,
    discover_enabled: true,
    discover_score: config.discoverScore ?? 150,
    rating_avg: config.rating ?? 4.5,
    review_count: config.reviews ?? 0,
    join_approval_mode: "auto_accept",
    access_status: "open",
    member_count: config.memberCount,
  };

  const { data: existing } = await db
    .from("communities")
    .select("id")
    .eq("slug", config.slug)
    .maybeSingle();

  if (existing) {
    const { data, error } = await db
      .from("communities")
      .update(payload)
      .eq("id", existing.id)
      .select("id, slug")
      .single();
    if (error) throw error;
    await applyEngagementMetrics(db, data.id, config.memberCount);
    return data;
  }

  const { data, error } = await db
    .from("communities")
    .insert(payload)
    .select("id, slug")
    .single();
  if (error) throw error;
  await applyEngagementMetrics(db, data.id, config.memberCount);
  return data;
}

async function applyEngagementMetrics(db, communityId, memberCount) {
  const metrics = {
    view_count_total: memberCount * 12,
    view_count_weekly: Math.round(memberCount * 0.8),
    share_count: Math.round(memberCount * 0.05),
  };
  const { error } = await db.from("communities").update(metrics).eq("id", communityId);
  if (error?.message?.includes("view_count") || error?.message?.includes("share_count")) {
    return;
  }
  if (error) throw error;
}

async function ensureGroup(db, communityId, g, sortOrder) {
  const row = {
    community_id: communityId,
    slug: g.slug,
    title: g.title,
    description: g.description,
    sort_order: sortOrder,
    is_public: true,
    group_type: g.groupType ?? "group",
    price_cents: g.priceCents ?? null,
    currency: "eur",
    rating_avg: g.rating ?? 0,
    review_count: g.reviews ?? 0,
    member_count: Math.round(Math.random() * 40 + 5),
  };

  const { data: existing } = await db
    .from("community_groups")
    .select("id")
    .eq("community_id", communityId)
    .eq("slug", g.slug)
    .maybeSingle();

  if (existing) {
    await db.from("community_groups").update(row).eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await db.from("community_groups").insert(row).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureMember(db, communityId, userId, role = "creator") {
  await db.from("community_members").upsert(
    { community_id: communityId, user_id: userId, role },
    { onConflict: "community_id,user_id" },
  );
}

async function seedEvent(db, communityId, creatorId, event) {
  const { data: existing } = await db
    .from("community_events")
    .select("id")
    .eq("community_id", communityId)
    .eq("slug", event.slug)
    .maybeSingle();

  const row = {
    community_id: communityId,
    slug: event.slug,
    title: event.title,
    description: event.description,
    starts_at: event.startsAt,
    ends_at: event.endsAt ?? null,
    location: event.location ?? "Online",
    is_public: true,
    is_featured: event.featured ?? false,
    created_by: creatorId,
    cover_url: event.coverUrl ?? null,
  };

  if (existing) {
    await db.from("community_events").update(row).eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await db.from("community_events").insert(row).select("id").single();
  if (error) throw error;
  return data.id;
}

async function seedCredential(db, communityId, creatorId, memberId, cred) {
  const { data: existing } = await db
    .from("credentials")
    .select("id")
    .eq("community_id", communityId)
    .eq("name", cred.name)
    .maybeSingle();

  let credId = existing?.id;
  if (!credId) {
    const { data, error } = await db
      .from("credentials")
      .insert({
        community_id: communityId,
        name: cred.name,
        description: cred.description,
        validity_mode: cred.validityMode ?? "permanent",
        category: cred.category ?? "community_award",
      })
      .select("id")
      .single();
    if (error) throw error;
    credId = data.id;
  }

  if (memberId && cred.grantToMember) {
    await db.from("user_credentials").upsert(
      {
        user_id: memberId,
        credential_id: credId,
        community_id: communityId,
        granted_by: creatorId,
        source_type: "manual_grant",
        visibility: "public",
      },
      { onConflict: "user_id,credential_id" },
    );
  }

  return credId;
}

async function seedReview(db, communityId, userId, rating, title, body) {
  const { count } = await db
    .from("community_reviews")
    .select("*", { count: "exact", head: true })
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if ((count ?? 0) > 0) return;

  await db.from("community_reviews").insert({
    community_id: communityId,
    user_id: userId,
    rating,
    title,
    body,
  });
}

async function seedPost(db, post) {
  const { count } = await db
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("community_id", post.communityId)
    .eq("title", post.title);

  if ((count ?? 0) > 0) return;

  await db.from("posts").insert({
    author_id: post.authorId,
    community_id: post.communityId,
    group_id: post.groupId ?? null,
    title: post.title,
    content: post.content,
    post_type: post.postType ?? "text",
    visibility: "public",
    is_pinned: post.pinned ?? false,
    like_count: post.likes ?? 12,
    comment_count: post.comments ?? 2,
    view_count: post.views ?? 200,
    share_count: post.shares ?? 3,
    media: post.media ?? [],
  });
}

const img = (id) => `https://images.unsplash.com/photo-${id}?w=900&q=80`;

async function main() {
  console.log("\n=== UNZE Marketing Demo Seed ===\n");

  if (process.env.UNZE_SKIP_BASE_SEED !== "true") {
    console.log("1. Basis-Demo (seed:demo)�");
    const result = spawnSync(process.execPath, ["scripts/seed-demo-platform.mjs"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if (result.status !== 0) {
      console.error("Basis-Seed fehlgeschlagen.");
      process.exit(1);
    }
  }

  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY erforderlich.");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const db = admin;

  const creator = await findUserByEmail(admin, DEMO_CREATOR_EMAIL);
  if (!creator) {
    console.error("Demo-Creator nicht gefunden � zuerst npm run seed:demo");
    process.exit(1);
  }

  const { data: demoMember } = await db
    .from("profiles")
    .select("id")
    .eq("username", "maxssl")
    .maybeSingle();

  console.log("\n2. Marketing-Communities�");
  const communityRows = [];
  for (const config of MARKETING_COMMUNITIES) {
    const row = await ensureCommunity(db, creator.id, config);
    communityRows.push({ row, config });
    await ensureMember(db, row.id, creator.id, "creator");
    console.log(`  ? ${config.slug} (${config.memberCount} Mitglieder simuliert)`);
  }

  console.log("\n3. Gruppen, Services & Produkte�");
  for (const { row, config } of communityRows) {
    const groups = MARKETING_GROUPS_BY_SLUG[config.slug] ?? [];
    for (const [i, g] of groups.entries()) {
      await ensureGroup(db, row.id, g, i);
    }
  }

  console.log("\n4. Events�");
  const now = Date.now();
  const eventDefs = [
    {
      slug: "fit-squad-dach",
      events: [
        {
          slug: "hiit-challenge",
          title: "30-Tage HIIT Challenge",
          description: "T\u00e4gliche Workouts + Community-Accountability.",
          startsAt: new Date(now + 5 * 86400000).toISOString(),
          featured: true,
          coverUrl: img("1571019614242-8296df794483"),
        },
      ],
    },
    {
      slug: "code-craft-academy",
      events: [
        {
          slug: "hackathon-sprint",
          title: "Weekend Hackathon Sprint",
          description: "48h Build-Challenge mit Mentoren und Preisen.",
          startsAt: new Date(now + 10 * 86400000).toISOString(),
          featured: true,
          coverUrl: img("1517694716992-1294190597461"),
        },
      ],
    },
    {
      slug: "mathe-meister",
      events: [
        {
          slug: "abi-crashkurs",
          title: "Abi Crashkurs Analysis",
          description: "Intensiv-Session vor den Klausuren.",
          startsAt: new Date(now + 7 * 86400000).toISOString(),
          coverUrl: img("1635077961362-43a641198da9"),
        },
      ],
    },
    {
      slug: "sound-wave-studio",
      events: [
        {
          slug: "release-party",
          title: "Release Party Live",
          description: "Neue Tracks vorstellen + Feedback-Runde.",
          startsAt: new Date(now + 3 * 86400000).toISOString(),
          coverUrl: img("1511379932388-26063254c126"),
        },
      ],
    },
    {
      slug: "lens-masters-guild",
      events: [
        {
          slug: "street-photo-walk",
          title: "Street Photo Walk Berlin",
          description: "Gef\u00fchrtes Shooting + Portfolio-Review.",
          startsAt: new Date(now + 14 * 86400000).toISOString(),
          featured: true,
          coverUrl: img("1452587925140-597944b587b6"),
        },
      ],
    },
  ];

  for (const def of eventDefs) {
    const community = communityRows.find((c) => c.config.slug === def.slug);
    if (!community) continue;
    for (const event of def.events) {
      await seedEvent(db, community.row.id, creator.id, event);
    }
  }

  console.log("\n5. Auszeichnungen & Zertifikate�");
  const credDefs = [
    {
      slug: "lens-masters-guild",
      creds: [
        {
          name: "Workshop Abschluss",
          description: "Teilnahmezertifikat Street Photography",
          category: "certificate",
          grantToMember: true,
        },
        {
          name: "Portfolio Star",
          description: "Top-Portfolio der Woche",
          category: "community_award",
        },
      ],
    },
    {
      slug: "code-craft-academy",
      creds: [
        {
          name: "Full-Stack Graduate",
          description: "Abschlusszertifikat Web Dev Track",
          category: "certificate",
          grantToMember: true,
        },
      ],
    },
    {
      slug: "mathe-meister",
      creds: [
        {
          name: "Olympiade Qualifikation",
          description: "Qualifikation Landesrunde",
          category: "certificate",
        },
      ],
    },
    {
      slug: "fit-squad-dach",
      creds: [
        {
          name: "30-Tage Challenge",
          description: "Challenge abgeschlossen",
          category: "event_award",
          grantToMember: true,
        },
      ],
    },
  ];

  for (const def of credDefs) {
    const community = communityRows.find((c) => c.config.slug === def.slug);
    if (!community) continue;
    for (const cred of def.creds) {
      await seedCredential(
        db,
        community.row.id,
        creator.id,
        demoMember?.id ?? creator.id,
        cred,
      );
    }
  }

  console.log("\n6. Bewertungen & Feed�");
  for (const { row, config } of communityRows) {
    if (demoMember?.id) {
      await seedReview(
        db,
        row.id,
        demoMember.id,
        config.rating,
        "Starke Community",
        `Sehr aktive ${config.category}-Community mit klaren Strukturen und guten Events.`,
      );
    }

    await seedPost(db, {
      communityId: row.id,
      authorId: creator.id,
      title: `Willkommen bei ${config.title}`,
      content: `${config.description}\n\nSchaut in den Gruppen vorbei und stellt euch im Feed vor.`,
      postType: "community_update",
      pinned: true,
      likes: Math.round(config.memberCount * 0.05),
      views: Math.round(config.memberCount * 2),
      media: [{ type: "image", url: img("1522071820081-009f0129c71c"), alt: config.title }],
    });
  }

  console.log("\n=== Marketing Demo Seed ERFOLGREICH ===\n");
  console.log("Neue Communities:");
  for (const c of MARKETING_COMMUNITIES) {
    console.log(`  https://www.unze.app/community/${c.slug}`);
  }
  console.log("\nDiscover: https://www.unze.app/discover\n");
}

main().catch((err) => {
  console.error("\n? Marketing Seed fehlgeschlagen:", err.message);
  process.exit(1);
});

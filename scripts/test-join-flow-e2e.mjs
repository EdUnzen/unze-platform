#!/usr/bin/env node
/**
 * Community Join/Leave Flow — DB Smoke (Service Role)
 * Usage: npm run test:join-flow
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(root, "docs", "sprints", "JOIN_FLOW_E2E_REPORT.md");

function loadEnv() {
  const env = { ...process.env };
  for (const f of [join(root, ".env.local"), join(root, ".env.vercel")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
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

/** @type {Array<{step:string, status:'ok'|'fail', note:string}>} */
const results = [];

function record(step, status, note) {
  results.push({ step, status, note });
  console.log(`${status === "ok" ? "✓" : "✗"} ${step}: ${note}`);
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✗ SUPABASE URL/Service Role fehlt");
    process.exit(1);
  }

  const admin = createClient(url, key);
  console.log("\n=== Community Join Flow E2E (DB) ===\n");

  const { data: community } = await admin
    .from("communities")
    .select("id, slug, member_count")
    .eq("slug", "rocket-league-ssl")
    .maybeSingle();

  if (!community) {
    record("Community finden", "fail", "rocket-league-ssl nicht in DB");
    writeReport();
    process.exit(1);
  }
  record("Community finden", "ok", community.slug);

  const { data: testUser } = await admin
    .from("profiles")
    .select("id, display_name")
    .eq("username", "maxssl")
    .maybeSingle();

  if (!testUser) {
    record("Testnutzer", "fail", "maxssl nicht gefunden");
    writeReport();
    process.exit(1);
  }
  record("Testnutzer", "ok", testUser.display_name ?? testUser.id);

  const countBefore = community.member_count ?? 0;

  await admin
    .from("community_members")
    .delete()
    .eq("community_id", community.id)
    .eq("user_id", testUser.id);

  const { error: joinErr } = await admin.from("community_members").insert({
    community_id: community.id,
    user_id: testUser.id,
    role: "member",
  });

  if (joinErr) {
    record("Fall A — Beitritt", "fail", joinErr.message);
  } else {
    record("Fall A — Beitritt", "ok", "Insert erfolgreich");
  }

  const { error: dupErr } = await admin.from("community_members").insert({
    community_id: community.id,
    user_id: testUser.id,
    role: "member",
  });

  if (dupErr?.message.includes("community_members_community_id_user_id_key")) {
    record("Fall B — Duplicate Key", "ok", "Constraint greift (App mappt zu freundlicher Meldung)");
  } else if (dupErr) {
    record("Fall B — Duplicate Key", "fail", dupErr.message);
  } else {
    record("Fall B — Duplicate Key", "fail", "Kein Constraint-Fehler — unerwartet");
  }

  const { data: memberRow } = await admin
    .from("community_members")
    .select("id")
    .eq("community_id", community.id)
    .eq("user_id", testUser.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (memberRow) {
    const { error: leaveErr } = await admin.rpc("soft_remove_community_member", {
      p_member_id: memberRow.id,
      p_actor_id: testUser.id,
    });
    if (leaveErr) {
      record("Fall C — Verlassen", "fail", leaveErr.message);
    } else {
      record("Fall C — Verlassen", "ok", "Soft-Remove erfolgreich");
    }
  } else {
    record("Fall C — Verlassen", "fail", "Mitglied nicht gefunden");
  }

  const { data: afterLeave } = await admin
    .from("community_members")
    .select("id, deleted_at")
    .eq("community_id", community.id)
    .eq("user_id", testUser.id)
    .maybeSingle();

  if (afterLeave?.deleted_at) {
    record("Fall C — Status", "ok", "deleted_at gesetzt");
  } else {
    record("Fall C — Status", "fail", "Soft-Delete nicht sichtbar");
  }

  const { error: rejoinErr } = await admin.from("community_members").insert({
    community_id: community.id,
    user_id: testUser.id,
    role: "member",
  });

  if (rejoinErr?.message.includes("community_members_community_id_user_id_key")) {
    const { error: reactivateErr } = await admin
      .from("community_members")
      .update({ deleted_at: null, role: "member" })
      .eq("id", afterLeave.id);
    if (reactivateErr) {
      record("Rejoin nach Leave", "fail", reactivateErr.message);
    } else {
      record("Rejoin nach Leave", "ok", "Reaktivierung statt Duplicate-Key");
    }
  } else if (rejoinErr) {
    record("Rejoin nach Leave", "fail", rejoinErr.message);
  } else {
    record("Rejoin nach Leave", "ok", "Neuer Insert nach Cleanup");
  }

  await admin
    .from("community_members")
    .update({ deleted_at: new Date().toISOString() })
    .eq("community_id", community.id)
    .eq("user_id", testUser.id);

  record("Cleanup", "ok", `member_count vor Test: ${countBefore}`);

  writeReport();
  const fails = results.filter((r) => r.status === "fail").length;
  process.exit(fails ? 1 : 0);
}

function writeReport() {
  mkdirSync(join(root, "docs", "sprints"), { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const md = `# Join Flow E2E Report

**Datum:** ${date}

| Schritt | Status | Notiz |
|---------|--------|-------|
${results.map((r) => `| ${r.step} | ${r.status === "ok" ? "✅" : "❌"} | ${r.note} |`).join("\n")}

_UI-Feedback (Success-Meldungen) manuell im Browser prüfen._
`;
  writeFileSync(REPORT, md, "utf8");
  console.log(`\n→ ${REPORT}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

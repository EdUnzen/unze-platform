#!/usr/bin/env node
/**
 * Event Ticket V1 — DB/API Smoke (Service Role)
 * Usage: npm run test:event-tickets
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(root, "docs", "sprints", "EVENT_TICKET_E2E_REPORT.md");

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
  console.log("\n=== Event Ticket E2E (DB) ===\n");

  let event = null;
  let tempEvent = false;

  const { data: futureEvent } = await admin
    .from("community_events")
    .select("id, community_id, title")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (futureEvent) {
    event = futureEvent;
    record("Event finden", "ok", `${event.title} (${event.id})`);
  } else {
    const { data: community } = await admin
      .from("communities")
      .select("id, slug")
      .limit(1)
      .maybeSingle();

    if (!community) {
      record("Event finden", "fail", "Keine Community in DB");
      writeReport();
      process.exit(1);
    }

    const slug = `e2e-${Date.now().toString(36)}`;
    const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: created, error: createErr } = await admin
      .from("community_events")
      .insert({
        community_id: community.id,
        slug,
        title: "E2E Ticket Test Event",
        description: "Automatischer Closed-Beta Smoke-Test",
        starts_at: startsAt,
        is_public: true,
      })
      .select("id, community_id, title")
      .single();

    if (createErr || !created) {
      record("Event anlegen", "fail", createErr?.message ?? "Insert fehlgeschlagen");
      writeReport();
      process.exit(1);
    }
    event = created;
    tempEvent = true;
    record("Event anlegen", "ok", `${event.title} (${event.id})`);
  }

  const { data: member } = await admin
    .from("community_members")
    .select("user_id, role")
    .eq("community_id", event.community_id)
    .eq("role", "creator")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  const { data: testUser } = await admin
    .from("profiles")
    .select("id, display_name")
    .neq("id", member?.user_id ?? "")
    .limit(1)
    .maybeSingle();

  if (!testUser || !member) {
    record("Testnutzer", "fail", "Kein Testnutzer oder Creator gefunden");
    writeReport();
    process.exit(1);
  }
  record("Testnutzer", "ok", testUser.display_name ?? testUser.id);

  await admin
    .from("event_tickets")
    .delete()
    .eq("event_id", event.id)
    .eq("user_id", testUser.id);

  const ticketCode = `UNZE-TEST-${randomBytes(6).toString("hex").toUpperCase()}`;
  const { data: ticket, error: bookErr } = await admin
    .from("event_tickets")
    .insert({
      event_id: event.id,
      community_id: event.community_id,
      user_id: testUser.id,
      ticket_code: ticketCode,
      status: "active",
    })
    .select("id, ticket_code, status")
    .single();

  if (bookErr || !ticket) {
    record("Ticket buchen", "fail", bookErr?.message ?? "Insert fehlgeschlagen");
    writeReport();
    process.exit(1);
  }
  record("Ticket buchen", "ok", ticket.ticket_code);

  const { data: profileTicket } = await admin
    .from("event_tickets")
    .select("id, status")
    .eq("user_id", testUser.id)
    .eq("event_id", event.id)
    .maybeSingle();

  if (!profileTicket) {
    record("Ticket im Profil (DB)", "fail", "Nicht gefunden");
  } else {
    record("Ticket im Profil (DB)", "ok", `status=${profileTicket.status}`);
  }

  const { error: cancelErr } = await admin
    .from("event_tickets")
    .update({ status: "cancelled" })
    .eq("id", ticket.id)
    .eq("user_id", testUser.id);

  if (cancelErr) {
    record("Ticket stornieren", "fail", cancelErr.message);
  } else {
    record("Ticket stornieren", "ok", "status=cancelled");
  }

  const ticketCode2 = `UNZE-TEST-${randomBytes(6).toString("hex").toUpperCase()}`;
  const { data: ticket2, error: book2Err } = await admin
    .from("event_tickets")
    .update({
      status: "active",
      ticket_code: ticketCode2,
      booked_at: new Date().toISOString(),
      checked_in_at: null,
    })
    .eq("id", ticket.id)
    .select("id, ticket_code, status")
    .single();

  if (book2Err || !ticket2) {
    record("Ticket für Check-In", "fail", book2Err?.message ?? "Insert fehlgeschlagen");
    writeReport();
    process.exit(1);
  }

  const { data: checkInPayload, error: checkErr } = await admin.rpc("check_in_event_ticket", {
    p_ticket_code: ticketCode2,
    p_actor_id: member.user_id,
  });

  const checkInId =
    typeof checkInPayload === "string" ? checkInPayload : checkInPayload?.ticketId;

  if (checkErr) {
    record("Creator Check-In", "fail", checkErr.message);
  } else {
    const rewardNote =
      checkInPayload?.rewards?.grantedCredential || checkInPayload?.rewards?.unlockedGroup
        ? ` rewards=${JSON.stringify(checkInPayload.rewards)}`
        : "";
    record("Creator Check-In", "ok", `ticketId=${checkInId}${rewardNote}`);
  }

  const { data: afterCheckIn } = await admin
    .from("event_tickets")
    .select("status, checked_in_at")
    .eq("id", ticket2.id)
    .single();

  if (afterCheckIn?.status === "used" && afterCheckIn.checked_in_at) {
    record("Status eingecheckt", "ok", afterCheckIn.checked_in_at);
  } else {
    record("Status eingecheckt", "fail", `status=${afterCheckIn?.status}`);
  }

  const { error: doubleErr } = await admin.rpc("check_in_event_ticket", {
    p_ticket_code: ticketCode2,
    p_actor_id: member.user_id,
  });

  if (doubleErr && doubleErr.message.includes("bereits verwendet")) {
    record("Mehrfachnutzung blockiert", "ok", doubleErr.message);
  } else if (doubleErr) {
    record("Mehrfachnutzung blockiert", "ok", doubleErr.message);
  } else {
    record("Mehrfachnutzung blockiert", "fail", "Zweiter Check-In nicht blockiert");
  }

  const { count: total } = await admin
    .from("event_tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .neq("status", "cancelled");

  const { count: used } = await admin
    .from("event_tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("status", "used");

  record(
    "Event-Statistik",
    "ok",
    `total=${total ?? 0}, eingecheckt=${used ?? 0}, offen=${(total ?? 0) - (used ?? 0)}`,
  );

  await admin.from("event_tickets").delete().eq("id", ticket2.id);
  await admin.from("event_tickets").delete().eq("id", ticket.id);
  record("Cleanup", "ok", "Test-Ticket entfernt");

  if (tempEvent) {
    await admin.from("community_events").delete().eq("id", event.id);
    record("Event Cleanup", "ok", "Temporäres Event entfernt");
  }

  writeReport();
  const fails = results.filter((r) => r.status === "fail").length;
  process.exit(fails ? 1 : 0);
}

function writeReport() {
  mkdirSync(join(root, "docs", "sprints"), { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const md = `# Event Ticket E2E Report

**Datum:** ${date}  
**Typ:** Automatisierter DB/API-Test (Service Role)

| Schritt | Status | Notiz |
|---------|--------|-------|
${results.map((r) => `| ${r.step} | ${r.status === "ok" ? "✅" : "❌"} | ${r.note} |`).join("\n")}

_QR-Code UI und Profil-Seite: manuell im Browser mit Login prüfen._
`;
  writeFileSync(REPORT, md, "utf8");
  console.log(`\n→ ${REPORT}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

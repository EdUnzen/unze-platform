#!/usr/bin/env node
/**
 * UNZE Connect — Zwei-Nutzer-Isolation (CORSA S9 / G10).
 * Profile-Lesen ist bewusst öffentlich; Schreiben und private Daten nicht.
 *
 *   npm run security:isolation
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnvFile(".env.local"), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("BLOCKED: NEXT_PUBLIC_SUPABASE_URL oder NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt");
  process.exit(2);
}

async function ensureUser(email, password) {
  if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt");
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) return existing.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function userClient(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return client;
}

function anonClient() {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  const stamp = Date.now().toString(36).slice(-6);
  const emailA = `rls-test-a-${stamp}@local.dev`;
  const emailB = `rls-test-b-${stamp}@local.dev`;
  const password = "RlsTest-Unze-2026!";
  const createdUserIds = [];

  const report = {
    generatedAt: new Date().toISOString(),
    project: "UNZE Connect",
    standard: "CORSA Sicherheit_Regeln S9/S15 G10",
    mode: "two-identity-isolation",
    supabaseUrl: SUPABASE_URL,
    users: { a: emailA, b: emailB },
    steps: [],
    pass: true,
    findings: [],
  };

  function step(id, pass, detail = {}) {
    report.steps.push({ id, pass, ...detail });
    if (!pass) {
      report.pass = false;
      report.findings.push(id);
    }
  }

  const idA = await ensureUser(emailA, password);
  const idB = await ensureUser(emailB, password);
  createdUserIds.push(idA, idB);

  const clientA = await userClient(emailA, password);
  const clientB = await userClient(emailB, password);
  const guest = anonClient();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: userA },
  } = await clientA.auth.getUser();
  const {
    data: { user: userB },
  } = await clientB.auth.getUser();

  const { data: guestNotes } = await guest.from("notifications").select("id").limit(5);
  step("anon_notifications_empty", !guestNotes || guestNotes.length === 0, {
    returned: guestNotes?.length ?? 0,
  });

  const { data: noteA, error: noteErr } = await admin
    .from("notifications")
    .insert({
      user_id: userA.id,
      type: "system",
      title: `Secret-A-${stamp}`,
      body: "Privat an A",
    })
    .select("id")
    .single();
  step("admin_create_notification_A", !noteErr && Boolean(noteA?.id), {
    error: noteErr?.message ?? null,
  });

  const { data: aNote } = await clientA.from("notifications").select("id, title").eq("id", noteA?.id).maybeSingle();
  step("A_reads_own_notification", Boolean(aNote?.id), { returned: aNote?.id ?? null });

  const { data: bNote } = await clientB.from("notifications").select("id, title").eq("id", noteA?.id).maybeSingle();
  step("B_select_A_notification_denied", !bNote, { returned: bNote ?? null });

  const { data: pushA, error: pushErr } = await clientA
    .from("push_subscriptions")
    .insert({
      user_id: userA.id,
      endpoint: `https://example.invalid/push/${stamp}`,
      p256dh: "test-p256dh",
      auth: "test-auth",
    })
    .select("id")
    .single();
  step("A_create_push_subscription", !pushErr && Boolean(pushA?.id), {
    error: pushErr?.message ?? null,
  });

  const { data: bPush } = await clientB.from("push_subscriptions").select("id").eq("id", pushA?.id).maybeSingle();
  step("B_select_A_push_denied", !bPush, { returned: bPush ?? null });

  const { data: stolenPush, error: stolenPushErr } = await clientB
    .from("push_subscriptions")
    .insert({
      user_id: userA.id,
      endpoint: `https://example.invalid/steal/${stamp}`,
      p256dh: "x",
      auth: "y",
    })
    .select("id")
    .maybeSingle();
  step("B_insert_push_as_A_denied", Boolean(stolenPushErr) && !stolenPush, {
    error: stolenPushErr?.message ?? null,
  });

  const { data: profilePublic } = await clientB.from("profiles").select("id").eq("id", userA.id).maybeSingle();
  step("B_select_A_profile_public_by_design", Boolean(profilePublic?.id), {
    note: "ISO-PROFILE: profiles SELECT ist bewusst öffentlich (Community).",
  });

  const { data: bUpdProfile } = await clientB
    .from("profiles")
    .update({ display_name: "HACK-B" })
    .eq("id", userA.id)
    .select("id");
  step("B_update_A_profile_denied", (bUpdProfile?.length ?? 0) === 0, {
    updatedRows: bUpdProfile?.length ?? 0,
  });

  const { data: roleEsc, error: roleErr } = await clientB
    .from("profiles")
    .update({ platform_role: "platform_admin" })
    .eq("id", userB.id)
    .select("id, platform_role")
    .maybeSingle();
  const escalated = roleEsc?.platform_role === "platform_admin";
  step("B_cannot_self_promote_admin", !escalated, {
    error: roleErr?.message ?? null,
    role: roleEsc?.platform_role ?? null,
    note: escalated ? "FINDING: profiles UPDATE erlaubt platform_admin ohne Server-Guard" : null,
  });
  if (escalated) {
    await admin.from("profiles").update({ platform_role: "user" }).eq("id", userB.id);
  }

  const slug = `rls-a-${stamp}`;
  const { data: communityA, error: commErr } = await clientA
    .from("communities")
    .insert({
      slug,
      title: `RLS Hidden A ${stamp}`,
      visibility: "hidden",
      creator_id: userA.id,
    })
    .select("id, creator_id")
    .single();
  step("A_create_hidden_community", !commErr && communityA?.creator_id === userA.id, {
    error: commErr?.message ?? null,
  });

  const { data: bComm } = await clientB.from("communities").select("id, title").eq("id", communityA?.id).maybeSingle();
  step("B_select_A_hidden_community_denied", !bComm, { returned: bComm ?? null });

  const { data: stolenComm, error: stolenCommErr } = await clientB
    .from("communities")
    .insert({
      slug: `steal-${stamp}`,
      title: `Steal ${stamp}`,
      visibility: "hidden",
      creator_id: userA.id,
    })
    .select("id")
    .maybeSingle();
  step("B_insert_community_as_A_denied", Boolean(stolenCommErr) && !stolenComm, {
    error: stolenCommErr?.message ?? null,
  });

  const { data: existingCred } = await admin.from("credentials").select("id").limit(1).maybeSingle();
  if (existingCred?.id && communityA?.id) {
    const { data: credA, error: credErr } = await admin
      .from("user_credentials")
      .insert({
        user_id: userA.id,
        community_id: communityA.id,
        credential_id: existingCred.id,
        visibility: "private",
      })
      .select("id")
      .single();
    step("admin_create_user_credential_A", !credErr && Boolean(credA?.id), {
      error: credErr?.message ?? null,
    });
    const { data: bCred } = await clientB.from("user_credentials").select("id").eq("id", credA?.id).maybeSingle();
    step("B_select_A_user_credential_denied", !bCred, { returned: bCred ?? null });
    if (credA?.id) await admin.from("user_credentials").delete().eq("id", credA.id);
  } else {
    step("user_credentials_skipped", true, { note: "Kein bestehendes Credential — Fall übersprungen" });
  }

  if (noteA?.id) await admin.from("notifications").delete().eq("id", noteA.id);
  if (pushA?.id) await admin.from("push_subscriptions").delete().eq("id", pushA.id);
  if (communityA?.id) await admin.from("communities").delete().eq("id", communityA.id);
  for (const uid of createdUserIds) {
    await admin.auth.admin.deleteUser(uid);
  }

  const outDir = path.join(process.cwd(), "docs", "security");
  fs.mkdirSync(outDir, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  const outFile = path.join(outDir, `isolation-test-${day}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log("Report:", path.relative(process.cwd(), outFile));
  console.log("Pass:", report.pass);
  if (report.findings.length) console.log("Findings:", report.findings.join(", "));
  for (const s of report.steps) {
    console.log(`  ${s.pass ? "OK" : "FAIL"} ${s.id}${s.error ? ` — ${s.error}` : ""}${s.note ? ` — ${s.note}` : ""}`);
  }
  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

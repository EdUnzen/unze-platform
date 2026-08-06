#!/usr/bin/env node
/**
 * Service-Modul — DB Smoke (Service Role)
 * Usage: npm run test:services
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(root, "docs", "sprints", "SERVICE_E2E_REPORT.md");

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

function writeReport() {
  mkdirSync(dirname(REPORT), { recursive: true });
  const lines = [
    "# Service E2E Report",
    "",
    `Datum: ${new Date().toISOString()}`,
    "",
    "| Schritt | Status | Notiz |",
    "| --- | --- | --- |",
    ...results.map((r) => `| ${r.step} | ${r.status} | ${r.note} |`),
    "",
    `**Ergebnis:** ${results.every((r) => r.status === "ok") ? "OK" : "FEHLER"}`,
  ];
  writeFileSync(REPORT, lines.join("\n"));
  console.log(`\nReport: ${REPORT}`);
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
  console.log("\n=== Service Modul E2E (DB) ===\n");

  const { data: services, error: listErr } = await admin
    .from("community_groups")
    .select(
      "id, slug, title, group_type, price_cents, is_public, community_id, community:communities(slug, title)",
    )
    .eq("group_type", "service")
    .limit(20);

  if (listErr) {
    record("Services laden", "fail", listErr.message);
    writeReport();
    process.exit(1);
  }

  if (!services?.length) {
    record("Demo-Services", "fail", "Keine Services in DB — npm run seed:demo ausführen");
    writeReport();
    process.exit(1);
  }

  record("Services laden", "ok", `${services.length} Service(s) gefunden`);

  const demo = services.find((s) => s.slug === "einzelcoaching") ?? services[0];
  record(
    "Service-Detail (Demo)",
    "ok",
    `${demo.title} @ ${demo.community?.slug ?? "?"}/group/${demo.slug}`,
  );

  const publicServices = services.filter((s) => s.is_public !== false);
  record(
    "Öffentliche Services",
    publicServices.length > 0 ? "ok" : "fail",
    `${publicServices.length} öffentlich`,
  );

  const { data: discoverRows, error: discoverErr } = await admin
    .from("community_groups")
    .select("id, slug, title, group_type, community:communities!inner(slug, discover_enabled, visibility)")
    .eq("group_type", "service")
    .eq("is_public", true)
    .limit(10);

  if (discoverErr) {
    record("Discover-Query", "fail", discoverErr.message);
  } else {
    record("Discover-Query", "ok", `${discoverRows?.length ?? 0} in Discover sichtbar`);
  }

  const { data: testUser } = await admin
    .from("profiles")
    .select("id")
    .eq("username", "maxssl")
    .maybeSingle();

  if (!testUser) {
    record("Testnutzer", "fail", "maxssl nicht gefunden");
  } else {
    record("Testnutzer", "ok", "maxssl");
  }

  const originalPublic = demo.is_public;
  const { error: deactivateErr } = await admin
    .from("community_groups")
    .update({ is_public: false })
    .eq("id", demo.id);

  if (deactivateErr) {
    record("Service deaktivieren", "fail", deactivateErr.message);
  } else {
    record("Service deaktivieren", "ok", demo.slug);

    const { data: hidden } = await admin
      .from("community_groups")
      .select("id")
      .eq("id", demo.id)
      .eq("is_public", true)
      .maybeSingle();

    record(
      "Deaktivierung wirksam",
      hidden ? "fail" : "ok",
      hidden ? "Noch öffentlich" : "Nicht mehr öffentlich",
    );

    const { error: reactivateErr } = await admin
      .from("community_groups")
      .update({ is_public: originalPublic ?? true })
      .eq("id", demo.id);

    record(
      "Service reaktivieren",
      reactivateErr ? "fail" : "ok",
      reactivateErr?.message ?? "Wiederhergestellt",
    );
  }

  const { error: updateErr } = await admin
    .from("community_groups")
    .update({ description: "1:1 und Gruppen-Coaching" })
    .eq("id", demo.id)
    .eq("slug", "einzelcoaching");

  record(
    "Service bearbeiten",
    updateErr ? "fail" : "ok",
    updateErr?.message ?? "Beschreibung aktualisiert",
  );

  const base =
    env.E2E_BASE_URL ?? env.NEXT_PUBLIC_APP_URL ?? "https://www.unze.app";

  const urlChecks = [
    { path: "/discover?tab=services", label: "Discover Services" },
    {
      path: `/community/${demo.community?.slug ?? "rocket-league-ssl"}/group/${demo.slug}`,
      label: "Service-Detailseite",
    },
  ];

  for (const check of urlChecks) {
    try {
      const res = await fetch(`${base}${check.path}`, { redirect: "follow" });
      const html = await res.text();
      const ok = res.status === 200 && html.length > 500;
      record(
        check.label,
        ok ? "ok" : "fail",
        `HTTP ${res.status}${ok ? "" : " — Inhalt fehlt"}`,
      );
    } catch (err) {
      record(check.label, "fail", err.message);
    }
  }

  writeReport();
  const failed = results.filter((r) => r.status === "fail").length;
  if (failed) process.exit(1);
  console.log("\nAlle Service-Tests bestanden.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Stabilisierungs-Audit — prüft Migrationen, Routen und Bereiche.
 * Usage: npm run test:stabilization
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const REPORT = join(root, "docs", "sprints", "STABILIZATION_STATUS_REPORT.md");

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

/** @typedef {'ok'|'partial'|'fail'} Status */
/** @type {Array<{area:string, status:Status, cause:string, fix:string, url?:string}>} */
const areas = [];

function add(area, status, cause, fix, url) {
  areas.push({ area, status, cause, fix, url });
}

async function checkTable(client, table, select = "id") {
  const { error } = await client.from(table).select(select).limit(1);
  return !error;
}

async function checkMigrations(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    add("Migrationen 021–024", "fail", "Supabase-Env fehlt", ".env.local prüfen");
    return;
  }

  const client = createClient(url, key);
  const admin = serviceKey ? createClient(url, serviceKey) : client;

  const m021 = await checkTable(client, "platform_feature_flags", "key");
  const m022Events = await checkTable(client, "community_events");
  const m022Reviews = await checkTable(client, "community_reviews");
  const { error: gtErr } = await client.from("community_groups").select("group_type").limit(1);
  const m022Groups = !gtErr;
  const m024Pay = await checkTable(admin, "community_payments");
  const { error: priceErr } = await admin.from("communities").select("stripe_price_monthly_id").limit(1);

  const ok021 = m021;
  const ok022 = m022Events && m022Groups && m022Reviews;
  const ok024 = m024Pay && !priceErr;

  if (ok021 && ok022 && ok024) {
    add(
      "Migrationen 021–024",
      "ok",
      "Alle Tabellen und Spalten vorhanden",
      "—",
      "npm run check:migrations",
    );
  } else {
    const missing = [];
    if (!ok021) missing.push("021");
    if (!ok022) missing.push("022");
    if (!ok024) missing.push("024");
    add(
      "Migrationen 021–024",
      "fail",
      `Fehlend: ${missing.join(", ")}. 023 ist Daten-Sync (optional nach 022).`,
      "Supabase SQL Editor → database/migrations/BUNDLE_021_024.sql ausführen, dann npm run check:migrations",
      "Supabase SQL Editor",
    );
  }
}

async function probeRoute(base, path, expect, name) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    const hasContent = expect.every((s) => html.includes(s));
    if (res.status === 200 && hasContent) {
      return { ok: true, status: res.status, url };
    }
    if (res.status === 200) {
      return { ok: "partial", status: res.status, url, note: "Seite lädt, Inhalt eingeschränkt" };
    }
    return { ok: false, status: res.status, url };
  } catch (err) {
    return { ok: false, url, error: err.message };
  }
}

async function checkDiscover(base, migrationsOk) {
  const tabs = [
    { path: "/discover", name: "Communities", expect: ["Discover", "Communities"] },
    { path: "/discover?tab=groups", name: "Gruppen", expect: ["Gruppen"] },
    { path: "/discover?tab=events", name: "Events", expect: ["Events"] },
    { path: "/discover?tab=services", name: "Dienstleistungen", expect: ["Dienstleistung"] },
  ];

  for (const tab of tabs) {
    const r = await probeRoute(base, tab.path, tab.expect, tab.name);
    if (r.ok === true) {
      const status = migrationsOk || tab.name === "Communities" ? "ok" : "partial";
      add(
        `Discover — ${tab.name}`,
        status,
        migrationsOk ? "Route und Inhalt OK" : "Seite lädt; volle Daten erst nach Migration 022",
        migrationsOk ? "—" : "BUNDLE_021_024.sql ausführen",
        r.url,
      );
    } else if (r.ok === "partial") {
      add(`Discover — ${tab.name}`, "partial", r.note ?? "Teilinhalt", "Migrationen prüfen", r.url);
    } else {
      add(`Discover — ${tab.name}`, "fail", `HTTP ${r.status ?? r.error}`, "Server-Logs prüfen", r.url);
    }
  }
}

async function checkAreas(base, migrationsOk) {
  const checks = [
    { area: "Creator-Profil", path: "/creator/edudemo", expect: ["Creator", "Communities"], alt404: true },
    { area: "Nutzerprofil", path: "/profile", expect: ["Profil"] },
    { area: "Nutzerprofil — Billing", path: "/profile/billing", expect: ["Anmelden"] },
    { area: "Creator-Dashboard", path: "/dashboard", expect: ["Dashboard"] },
    { area: "Favoriten", path: "/favorites", expect: ["Favoriten"] },
    { area: "Community + Bewertungen", path: "/community/rocket-league-ssl", expect: ["Rocket League"] },
    { area: "Community — Events", path: "/community/rocket-league-ssl", expect: ["Events"], needs022: true },
  ];

  for (const c of checks) {
    const r = await probeRoute(base, c.path, c.expect, c.area);
    if (r.status === 404 && c.alt404) {
      add(c.area, "partial", "Demo-Creator edudemo nicht in DB — Route implementiert", "npm run seed:demo", `/creator/{username}`);
      continue;
    }
    if (r.ok === true) {
      if (c.needs022 && !migrationsOk) {
        add(c.area, "partial", "Community lädt; Event-Sektion leer ohne Migration 022", "022 ausführen", r.url);
      } else if (c.area.includes("Bewertungen") && !migrationsOk) {
        add(c.area, "partial", "Community lädt; Review-Tabellen fehlen (022)", "022 ausführen", r.url);
      } else {
        add(c.area, "ok", "Route HTTP 200, Kerninhalt vorhanden", "—", r.url);
      }
    } else {
      add(c.area, "fail", `HTTP ${r.status ?? r.error}`, "Build/Logs prüfen", r.url);
    }
  }
}

function checkMonetization(env, migrationsOk) {
  const stripeOk =
    env.STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
    env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_");

  if (!migrationsOk) {
    add(
      "Monetarisierung",
      "fail",
      "Migration 024 fehlt — keine Stripe-Tabellen/Preis-Spalten",
      "024 via BUNDLE_021_024.sql; siehe docs/sprints/STRIPE_MONETIZATION.md",
      "/dashboard/community/{slug}/monetization",
    );
    return;
  }
  if (!stripeOk) {
    add(
      "Monetarisierung",
      "partial",
      "Schema vorbereitet; Stripe-Keys fehlen in .env.local",
      "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, Customer Portal; npm run check:stripe",
      "/profile/billing",
    );
  } else {
    add(
      "Monetarisierung",
      "partial",
      "Konfiguration vorhanden; E2E-Zahlung manuell testen",
      "docs/sprints/STRIPE_MONETIZATION.md",
      "/profile/billing",
    );
  }
}

function writeReport(base, env) {
  mkdirSync(join(root, "docs", "sprints"), { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const byStatus = (s) => areas.filter((a) => a.status === s);

  const row = (a) =>
    `| **${a.area}** | ${a.status === "ok" ? "Funktioniert" : a.status === "partial" ? "Teilweise" : "Fehlerhaft"} | ${a.cause} | ${a.fix} | ${a.url ?? "—"} |`;

  const md = `# UNZE Stabilisierungs-Status

**Datum:** ${date}  
**Production:** ${base}  
**Supabase:** ${env.NEXT_PUBLIC_SUPABASE_URL ?? "—"}

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | ${byStatus("ok").length} |
| Teilweise | ${byStatus("partial").length} |
| Fehlerhaft | ${byStatus("fail").length} |

---

## Detailmatrix

| Bereich | Status | Ursache | Lösungsvorschlag | URL |
|---------|--------|---------|------------------|-----|
${areas.map(row).join("\n")}

---

## Migrationen — Ausführung

**Automatisch** (wenn \`SUPABASE_DB_URL\` in .env.local):

\`\`\`bash
npm run db:migrate:pending
\`\`\`

**Manuell** (empfohlen):

1. Supabase → SQL Editor
2. \`database/migrations/BUNDLE_021_024.sql\` einfügen und ausführen
3. \`npm run check:migrations\` → alle ✓
4. Optional: \`npm run seed:demo\`

---

## Nächste Schritte

1. Migrationen 021–024 ausführen (Blocker für Events, Dienstleistungen, Bewertungen, Monetarisierung)
2. \`npm run test:stabilization\` erneut — Ziel: 0 Fehlerhaft
3. Stripe Testmodus (\`npm run check:stripe\`) für Monetarisierung
4. Erst danach: Design/UX

---

_Via \`npm run test:stabilization\` generiert._
`;

  writeFileSync(REPORT, md, "utf8");
  console.log(`\n→ ${REPORT}\n`);
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const base = env.E2E_BASE_URL ?? "https://unze-platform.vercel.app";

  console.log("\n=== UNZE Stabilization Audit ===\n");

  await checkMigrations(env);

  const migrationsOk = areas.find((a) => a.area === "Migrationen 021–024")?.status === "ok";

  await checkDiscover(base, migrationsOk);
  await checkAreas(base, migrationsOk);
  checkMonetization(env, migrationsOk);

  try {
    execSync("npm run build", { cwd: root, stdio: "pipe" });
    add("Production Build", "ok", "npm run build erfolgreich", "—");
  } catch {
    add("Production Build", "fail", "Build fehlgeschlagen", "npm run build");
  }

  writeReport(base, env);

  const fails = areas.filter((a) => a.status === "fail").length;
  console.log(`Funktioniert: ${areas.filter((a) => a.status === "ok").length}`);
  console.log(`Teilweise: ${areas.filter((a) => a.status === "partial").length}`);
  console.log(`Fehlerhaft: ${fails}\n`);

  if (fails) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Monetization Production Readiness Test
 * Usage: npm run test:monetization
 *
 * Optional: E2E_BASE_URL=http://localhost:3002 (Dev-Server muss laufen)
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const REPORT_PATH = join(root, "docs", "sprints", "MONETIZATION_E2E_TEST_REPORT.md");

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

/** @type {Array<{area:string, status:Status, url?:string, note:string}>} */
const results = [];

function record(area, status, note, url) {
  results.push({ area, status, note, url });
}

async function checkTable(client, table, select = "id") {
  const { error } = await client.from(table).select(select).limit(1);
  return !error;
}

async function checkMigration024(admin) {
  const checks = [
    ["community_payments", "id", "024 — community_payments"],
    ["stripe_webhook_events", "event_id", "024 — stripe_webhook_events"],
  ];
  let ok = true;
  for (const [table, select, label] of checks) {
    const exists = await checkTable(admin, table, select);
    if (!exists) {
      record("Migration 024", "fail", `${label} fehlt`, "Supabase SQL Editor");
      ok = false;
    }
  }
  if (ok) {
    const { error } = await admin.from("communities").select("stripe_price_monthly_id").limit(1);
    if (error) {
      record("Migration 024", "fail", `Preis-Spalten fehlen: ${error.message}`, "Supabase");
      ok = false;
    }
  }
  if (ok) {
    record("Migration 024", "ok", "Tabellen und Preis-Spalten vorhanden", "Supabase");
  }
  return ok;
}

async function checkMigrations021022(admin) {
  const m021 = await checkTable(admin, "platform_feature_flags", "key");
  const m022Events = await checkTable(admin, "community_events");
  const m022Reviews = await checkTable(admin, "community_reviews");
  if (!m021) {
    record("Migration 021", "fail", "platform_feature_flags fehlt", "database/migrations/021_platform_feature_flags.sql");
  } else {
    record("Migration 021", "ok", "platform_feature_flags aktiv", "Supabase");
  }
  if (!m022Events || !m022Reviews) {
    record("Migration 022", "fail", "Events/Reviews-Tabellen fehlen", "database/migrations/022_platform_core_entities.sql");
  } else {
    record("Migration 022", "ok", "Events & Reviews aktiv", "Supabase");
  }
  return m021 && m022Events && m022Reviews;
}

async function checkStripe(env) {
  const hasSecret = env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
  const hasWebhook = env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_");
  const hasPk = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_");

  if (!hasSecret || !hasWebhook || !hasPk) {
    record(
      "Stripe Verbindung",
      "fail",
      "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET oder pk_test fehlt in .env.local",
      "Stripe Dashboard → Developers",
    );
    return false;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    await stripe.products.list({ limit: 1 });
    const portal = await stripe.billingPortal.configurations.list({ limit: 1 });
    if (portal.data.length === 0) {
      record(
        "Stripe Customer Portal",
        "fail",
        "Keine Portal-Configuration — Kündigung/Rechnungen nicht möglich",
        "Stripe Dashboard → Settings → Billing → Customer portal",
      );
      return false;
    }
    record("Stripe Verbindung", "ok", "Testmodus API + Customer Portal aktiv", "Stripe Dashboard");
    return true;
  } catch (err) {
    record("Stripe Verbindung", "fail", err.message, "Stripe Dashboard");
    return false;
  }
}

async function checkRoutes(base) {
  const routes = [
    { path: "/discover?tab=events", name: "Discover Events", expect: "Events" },
    { path: "/profile/billing", name: "Nutzer Abos", expect: "Anmelden" },
    { path: "/dashboard", name: "Dashboard", expect: "Dashboard" },
    { path: "/community/rocket-league-ssl", name: "Community Detail", expect: "Rocket League" },
    {
      path: "/dashboard/community/rocket-league-ssl/monetization",
      name: "Creator Finanzen",
      expect: "Anmelden",
    },
    {
      path: "/dashboard/community/rocket-league-ssl/events",
      name: "Creator Events",
      expect: "Anmelden",
    },
    { path: "/api/stripe/webhook", name: "Stripe Webhook", expect: null, method: "POST" },
  ];

  for (const route of routes) {
    const url = `${base}${route.path}`;
    try {
      const res = await fetch(url, {
        method: route.method ?? "GET",
        redirect: "follow",
        headers: route.method === "POST" ? { "Content-Type": "application/json" } : {},
        body: route.method === "POST" ? "{}" : undefined,
      });
      const html = await res.text();
      const contentOk = route.expect ? html.includes(route.expect) : true;
      if (route.path.includes("webhook")) {
        if (res.status === 400 || res.status === 401 || res.status === 405) {
          record("Webhook Route", "ok", `Endpoint erreichbar (HTTP ${res.status} ohne Signatur)`, url);
        } else {
          record("Webhook Route", "partial", `HTTP ${res.status}`, url);
        }
        continue;
      }
      if (res.status === 200 && contentOk) {
        record(route.name, "ok", `HTTP 200`, url);
      } else if (res.status === 200) {
        record(route.name, "partial", `HTTP 200, erwarteter Inhalt fehlt`, url);
      } else {
        record(route.name, "fail", `HTTP ${res.status}`, url);
      }
    } catch (err) {
      record(route.name, "fail", err.message, url);
    }
  }
}

async function checkBillingData(admin) {
  const paymentsTable = await checkTable(admin, "community_payments");
  if (!paymentsTable) {
    record("Billing-Daten", "fail", "community_payments fehlt — Migration 024", "Supabase");
    return;
  }

  const { count: subCount } = await admin
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  const { count: payCount } = await admin
    .from("community_payments")
    .select("*", { count: "exact", head: true });

  if ((subCount ?? 0) === 0 && (payCount ?? 0) === 0) {
    record(
      "Billing-Daten",
      "partial",
      "Keine Abos/Zahlungen in DB — E2E-Zahlungstest noch nicht durchgeführt",
      "Supabase subscriptions / community_payments",
    );
  } else {
    record(
      "Billing-Daten",
      "ok",
      `${subCount ?? 0} Abos, ${payCount ?? 0} Zahlungen in DB`,
      "Supabase",
    );
  }
}

function writeReport(env, base) {
  mkdirSync(join(root, "docs", "sprints"), { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const ok = results.filter((r) => r.status === "ok");
  const partial = results.filter((r) => r.status === "partial");
  const fail = results.filter((r) => r.status === "fail");

  const section = (title, items, emoji) => {
    if (!items.length) return `## ${title}\n\n_Keine Einträge._\n`;
    return (
      `## ${title}\n\n` +
      items
        .map((r) => {
          const url = r.url ? `\n  - URL: ${r.url}` : "";
          return `- **${r.area}** — ${r.note}${url}`;
        })
        .join("\n") +
      "\n"
    );
  };

  const md = `# Monetization E2E Testbericht

**Datum:** ${date}  
**Umgebung:** ${base}  
**Supabase:** ${env.NEXT_PUBLIC_SUPABASE_URL ?? "—"}  
**Stripe Testmodus:** ${env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ? "konfiguriert" : "nicht konfiguriert"}

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | ${ok.length} |
| Teilweise | ${partial.length} |
| Fehlerhaft | ${fail.length} |

---

${section("Funktioniert", ok, "✓")}

${section("Teilweise", partial, "⚠")}

${section("Fehlerhaft", fail, "✗")}

---

## Manuelle E2E-Schritte (nach Migration + Stripe)

1. Creator: Community + Gruppe + Dienstleistung + Event anlegen
2. Preise im Dashboard → Monetarisierung speichern
3. Nutzer: Monats-/Halbjahres-/Jahres-Abo + Einmalzahlung (Testkarte 4242…)
4. Kündigung über Stripe Customer Portal
5. Prüfen: \`/profile/billing\`, Creator-Dashboard Finanzen, Umsatz, Rechnungen

Siehe auch: \`docs/sprints/STRIPE_MONETIZATION.md\`

---

_Automatisch generiert via \`npm run test:monetization\`_
`;

  writeFileSync(REPORT_PATH, md, "utf8");
  console.log(`\n→ Bericht: ${REPORT_PATH}\n`);
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const base = env.E2E_BASE_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  console.log("\n=== UNZE Monetization E2E Test ===\n");

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    record("Supabase", "fail", "URL oder SERVICE_ROLE_KEY fehlt", ".env.local");
  } else {
    const admin = createClient(url, serviceKey);
    await checkMigrations021022(admin);
    await checkMigration024(admin);
    await checkBillingData(admin);
  }

  await checkStripe(env);
  await checkRoutes(base);

  try {
    execSync("npm run build", { cwd: root, stdio: "pipe" });
    record("Production Build", "ok", "next build erfolgreich", "npm run build");
  } catch {
    record("Production Build", "fail", "next build fehlgeschlagen", "npm run build");
  }

  writeReport(env, base);

  const fails = results.filter((r) => r.status === "fail").length;
  if (fails) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

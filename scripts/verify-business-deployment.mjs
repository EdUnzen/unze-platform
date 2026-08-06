#!/usr/bin/env node
/**
 * Preflight fuer UNZE Business + Studio Test-Deployment
 * Usage: npm run verify:business [--url=https://www.unze.app]
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv.find((a) => a.startsWith("--url="))?.slice(6) ?? "https://www.unze.app";

const checks = [];

/** Phase-2 Haupt-Routen (11 öffentliche Business-Seiten) */
const BUSINESS_PUBLIC_ROUTES = [
  { path: "/business", needle: "Digitale Lösungen, die Ihrem Unternehmen konkret nutzen" },
  { path: "/business/analyse", needle: "Quick Analyse" },
  { path: "/business/leistungen", needle: "Leistungen" },
  { path: "/business/business-core", needle: "Business Core" },
  { path: "/business/webseiten", needle: "Webseiten" },
  { path: "/business/web-apps", needle: "Apps" },
  { path: "/business/branchenloesungen", needle: "Branchen" },
  { path: "/business/preise", needle: "Preise" },
  { path: "/business/servicepakete", needle: "Service" },
  { path: "/business/kontakt", needle: "Hier startet Ihr nächstes Projekt" },
  { path: "/business/produkte", needle: "Produkte" },
];

async function fetchText(path) {
  const url = `${base.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { url, status: res.status, text, ok: res.ok };
}

async function main() {
  console.log(`UNZE Business Deployment Check — ${base}\n`);

  const business = await fetchText("/business");
  checks.push({
    name: "/business erreichbar (Phase-2 Hero)",
    pass:
      business.ok &&
      business.text.includes("UNZE Business") &&
      business.text.includes("Digitale Lösungen, die Ihrem Unternehmen konkret nutzen"),
  });

  checks.push({
    name: "/business — primärer CTA Analyse starten",
    pass: business.ok && business.text.includes("Analyse starten"),
  });

  checks.push({
    name: "/business — UNZE Business + Zur Community",
    pass:
      business.ok &&
      business.text.includes("UNZE Business") &&
      business.text.includes("Zur Community") &&
      (business.text.includes('href="/"') ||
        business.text.includes("href='/'") ||
        business.text.includes("← Zur Community")),
  });

  for (const route of BUSINESS_PUBLIC_ROUTES) {
    const page = await fetchText(route.path);
    checks.push({
      name: `${route.path} erreichbar`,
      pass: page.ok && page.text.includes(route.needle),
    });
  }

  const analyse = await fetchText("/business/analyse");
  checks.push({
    name: "/business/analyse — Premium Analyse",
    pass: analyse.ok && analyse.text.includes("Premium Analyse"),
  });

  const kontakt = await fetchText("/business/kontakt");
  checks.push({
    name: "/business/kontakt — Anfrage-Formular (SSR)",
    pass: kontakt.ok && kontakt.text.includes("E-Mail") && kontakt.text.includes("Unternehmen"),
  });

  const home = await fetchText("/");
  checks.push({
    name: "/ — Plattform-Startseite (Marketing-Shell, kein Business-Exit)",
    pass:
      home.ok &&
      home.text.includes("App nutzen") &&
      !home.text.includes("← Zur Community"),
  });

  const communities = await fetchText("/communities");
  checks.push({
    name: "/communities — Link zu UNZE Business",
    pass: communities.ok && communities.text.includes("UNZE Business"),
  });

  const studioRedirect = await fetch(`${base}/studio`, { redirect: "manual" });
  checks.push({
    name: "/studio redirect zu /business",
    pass: studioRedirect.status === 308 || studioRedirect.status === 307,
  });

  const admin = await fetchText("/admin");
  checks.push({
    name: "/admin Login erreichbar",
    pass: admin.ok && admin.text.includes("Admin-Zugang"),
  });

  const searchApi = await fetch(`${base}/api/public/communities?search=test&limit=3`);
  checks.push({
    name: "Community-Suche API",
    pass: searchApi.ok,
  });

  const inquiryApi = await fetch(`${base}/api/business/inquiries/quick`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactEmail: "invalid" }),
  });
  checks.push({
    name: "Anfrage-API erreichbar (Validierung)",
    pass: inquiryApi.status === 400,
  });

  let allPass = true;
  for (const c of checks) {
    const icon = c.pass ? "OK" : "FAIL";
    console.log(`  [${icon}] ${c.name}`);
    if (!c.pass) allPass = false;
  }

  console.log("");
  if (!allPass) {
    console.log("Einige Checks fehlgeschlagen.");
    process.exit(1);
  }
  console.log("Alle Checks bestanden.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

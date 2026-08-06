#!/usr/bin/env node
/**
 * Abschlusspruefung getrennte Domains (Landing + Plattform).
 * Usage: npm run verify:domain
 */
import { readFile, readdir, writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";

const root = process.cwd();
const MARKETING_URL = "https://www.unze.app";
const PLATFORM_URL = "https://www.unzeconnect.app";

const mode = process.argv.includes("--platform")
  ? "platform"
  : process.argv.includes("--marketing")
    ? "marketing"
    : "both";

const MARKETING_ROUTES = [
  { id: "landing", path: "/", expect: ["Geschlossene Beta", "Finde deine Community"] },
  { id: "communities", path: "/communities", expect: ["Entdecke Communities"] },
  { id: "events", path: "/events", expect: ["Oeffentliche Events"] },
  { id: "services", path: "/services", expect: ["Services aus Communities"] },
  { id: "studio", path: "/studio", expectRedirect: "/business" },
  { id: "community-preview", path: "/community/rocket-league-ssl", expect: ["Rocket League"] },
  { id: "verzeichnis-redirect", path: "/verzeichnis", expectRedirect: "/communities" },
  { id: "impressum", path: "/impressum", expect: ["Impressum"] },
  { id: "public-api-communities", path: "/api/public/communities?limit=1", expect: ["communities"], raw: true },
];

const PLATFORM_ROUTES = [
  { id: "home", path: "/", expect: ["UNZE"] },
  { id: "discover", path: "/discover", expect: ["Discover"] },
  { id: "login", path: "/auth/login", expect: ["UNZE"] },
  { id: "community", path: "/community/rocket-league-ssl", expect: ["Rocket League"] },
  { id: "service", path: "/community/rocket-league-ssl/group/einzelcoaching", expect: ["Einzelcoaching"] },
  { id: "dashboard", path: "/dashboard", expect: ["UNZE"], allowLoginRedirect: true },
  { id: "manifest", path: "/manifest.json", expect: ["www.unzeconnect.app"], raw: true },
];

const REDIRECT_CHECKS = [
  { url: "https://unze.app", expectHost: "www.unze.app" },
  { url: "https://unzeconnect.app/discover", expectHost: "www.unzeconnect.app" },
  { url: "https://unze-platform.vercel.app/discover", expectHost: "www.unzeconnect.app" },
  { url: `${MARKETING_URL}/discover`, expectHost: "www.unzeconnect.app" },
  { url: `${MARKETING_URL}/dashboard`, expectHost: "www.unzeconnect.app" },
  { url: `${PLATFORM_URL}/communities`, expectHost: "www.unze.app" },
  { url: `${PLATFORM_URL}/impressum`, expectHost: "www.unze.app" },
];

/** Plattform-Home darf NICHT auf Marketing umleiten */
const PLATFORM_HOME_CHECKS = [
  { url: `${PLATFORM_URL}/`, expectHost: "www.unzeconnect.app" },
];

const SOURCE_SCAN_IGNORE = [
  "node_modules",
  "_tmp",
  "landing-migration",
  "public/landing-migration",
  "docs/migration",
  "docs\\migration",
  ".next",
  "verify-domain-production.mjs",
  "migrate-manus-assets.mjs",
  "sync-vercel-env.mjs",
  "vercel.json",
  "lib/constants/site.ts",
  "lib\\constants\\site.ts",
  "_tmp",
];

const SOURCE_SCAN_DOMAINS = ["cloudfront.net", "manus-runtime", "__MANUS_HOST"];

function checkMark(ok) {
  return ok ? "\u2713" : "\u2717";
}

async function fetchRoute(base, route) {
  const url = `${base}${route.path}`;
  const res = await fetch(url, { redirect: "manual" });
  const body = route.raw ? await res.text() : res.status === 200 ? await res.text() : "";
  const location = res.headers.get("location") ?? "";

  if (route.expectRedirect) {
    const ok = [301, 302, 307, 308].includes(res.status) && location.includes(route.expectRedirect);
    return { id: route.id, base, ok, issues: ok ? [] : [`Erwartet Redirect zu ${route.expectRedirect}`] };
  }

  const followRes = route.raw ? res : await fetch(url, { redirect: "follow" });
  const followBody = route.raw ? body : await followRes.text();
  const finalUrl = followRes.url ?? url;

  const okStatus =
    followRes.status === 200 ||
    (route.allowLoginRedirect && finalUrl.includes("/auth/login"));
  const textOk =
    route.expect?.some((t) => followBody.includes(t)) ||
    (route.allowLoginRedirect && followBody.includes("UNZE"));
  const noManus =
    !followBody.includes("manus-runtime") && !followBody.includes("__MANUS_HOST_DEV__");
  const isMarketingBase = base.includes("www.unze.app");
  const noVercelVisible =
    !isMarketingBase || !followBody.includes("unze-platform.vercel.app");

  return {
    id: route.id,
    base,
    ok: okStatus && textOk && noManus && noVercelVisible,
    issues: [
      !okStatus ? `HTTP ${followRes.status}` : null,
      !textOk ? "Erwarteter Inhalt fehlt" : null,
      !noManus ? "Manus erkannt" : null,
      !noVercelVisible ? "vercel.app im Marketing-HTML" : null,
    ].filter(Boolean),
  };
}

async function checkRedirect({ url, expectHost }) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    const ok = [301, 302, 307, 308].includes(res.status) && loc.includes(expectHost);
    return { url, ok, status: res.status, location: loc, expectHost };
  } catch (err) {
    return { url, ok: false, error: err.message, expectHost };
  }
}

async function checkPlatformHome({ url, expectHost }) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const finalHost = new URL(res.url).host;
    const ok = res.status === 200 && finalHost === expectHost;
    return { url, ok, status: res.status, finalUrl: res.url, expectHost };
  } catch (err) {
    return { url, ok: false, error: err.message, expectHost };
  }
}

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (SOURCE_SCAN_IGNORE.some((i) => p.includes(i))) continue;
    await walk(p, files);
  }
  return files;
}

async function scanSource() {
  const hits = [];
  const files = await readdir(root, { recursive: true }).catch(() => []);
  for (const rel of files) {
    if (typeof rel !== "string") continue;
    if (!/\.(ts|tsx|mjs|js|json)$/.test(rel)) continue;
    if (SOURCE_SCAN_IGNORE.some((i) => rel.includes(i))) continue;
    const content = await readFile(join(root, rel), "utf8").catch(() => "");
    for (const domain of SOURCE_SCAN_DOMAINS) {
      if (content.includes(domain)) hits.push({ file: rel, domain });
    }
  }
  return hits;
}

async function main() {
  console.log("\n=== Domain-Abschlusspruefung (Landing + Plattform) ===\n");

  const routeResults = [];

  if (mode === "both" || mode === "marketing") {
    console.log(`--- Marketing (${MARKETING_URL}) ---`);
    for (const route of MARKETING_ROUTES) {
      const r = await fetchRoute(MARKETING_URL, route);
      routeResults.push(r);
      console.log(`${checkMark(r.ok)} ${route.id}${r.issues.length ? ": " + r.issues.join("; ") : ""}`);
    }
  }

  if (mode === "both" || mode === "platform") {
    console.log(`\n--- Plattform (${PLATFORM_URL}) ---`);
    for (const route of PLATFORM_ROUTES) {
      const r = await fetchRoute(PLATFORM_URL, route);
      routeResults.push(r);
      console.log(`${checkMark(r.ok)} ${route.id}${r.issues.length ? ": " + r.issues.join("; ") : ""}`);
    }
  }

  console.log("\n--- Cross-Domain-Redirects ---");
  const redirectResults = [];
  for (const check of REDIRECT_CHECKS) {
    const r = await checkRedirect(check);
    redirectResults.push(r);
    console.log(`${checkMark(r.ok)} ${check.url}${r.location ? " -> " + r.location : r.error ?? ""}`);
  }

  console.log("\n--- Connect-Home (kein Marketing-Redirect) ---");
  for (const check of PLATFORM_HOME_CHECKS) {
    const r = await checkPlatformHome(check);
    redirectResults.push(r);
    console.log(`${checkMark(r.ok)} ${check.url}${r.finalUrl ? " -> " + r.finalUrl : r.error ?? ""}`);
  }

  console.log("\n--- Quellcode-Scan (Manus/CDN) ---");
  const sourceHits = await scanSource();
  const sourceClean = sourceHits.length === 0;
  if (sourceClean) {
    console.log("\u2713 Keine Manus/CDN-Referenzen im App-Quellcode");
  } else {
    for (const h of sourceHits.slice(0, 15)) {
      console.log(`\u2717 ${h.domain} in ${h.file}`);
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    mode,
    marketingUrl: MARKETING_URL,
    platformUrl: PLATFORM_URL,
    databaseNote: "Keine DB-Aenderung � gleiche Supabase-Produktionsinstanz",
    routes: routeResults,
    redirects: redirectResults,
    sourceScanClean: sourceClean,
    sourceHits,
    allPassed:
      routeResults.every((r) => r.ok) &&
      redirectResults.every((r) => r.ok) &&
      sourceClean,
  };

  const outDir = join(root, "docs", "migration");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "DOMAIN_VERIFICATION_REPORT.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(`\nReport: docs/migration/DOMAIN_VERIFICATION_REPORT.json`);
  if (!report.allPassed) {
    console.error("\nEinige Pruefungen fehlgeschlagen (Deploy ggf. ausstehend).");
    process.exit(1);
  }
  console.log("\n\u2713 Alle Domain-Checks bestanden");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

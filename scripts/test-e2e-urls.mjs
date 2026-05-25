#!/usr/bin/env node
/**
 * E2E URL Smoke-Test — prüft HTTP-Status der Plattform-Routen.
 * Usage: npm run test:e2e-urls
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

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

const ROUTES = [
  { path: "/", name: "Home", expect: ["UNZE", "Discover"] },
  { path: "/discover", name: "Discover", expect: ["Discover"] },
  { path: "/discover?tab=feed", name: "Discover Feed", expect: ["Feed"] },
  { path: "/community/rocket-league-ssl", name: "Gaming Community", expect: ["Rocket League"] },
  { path: "/community/business-circle-dach", name: "Business Community", expect: ["Business"] },
  { path: "/community/creator-lounge", name: "Creator Lounge", expect: ["Creator Lounge"] },
  { path: "/auth/login", name: "Login", expect: ["Anmelden"] },
];

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  console.log(`\n=== E2E URL Test (${base}) ===\n`);

  let failed = 0;
  for (const route of ROUTES) {
    const url = `${base}${route.path}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const html = await res.text();
      const ok = res.status === 200;
      const hasContent = route.expect.every((s) => html.includes(s));
      const icon = ok && hasContent ? "✓" : "✗";
      console.log(
        `${icon} ${route.name}: HTTP ${res.status}${hasContent ? "" : " (Inhalt fehlt)"}`,
      );
      if (!ok || !hasContent) failed++;
    } catch (err) {
      console.log(`✗ ${route.name}: ${err.message}`);
      failed++;
    }
  }

  console.log("");
  if (failed) {
    console.error(`${failed} Route(n) fehlgeschlagen — Dev-Server auf ${base} läuft?\n`);
    process.exit(1);
  }
  console.log("Alle E2E-URLs erreichbar.\n");
}

main();

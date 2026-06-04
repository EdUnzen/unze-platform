#!/usr/bin/env node
/**
 * Prüft Community-Level, Fokus, Mitgliederbereich, Event/Service-Routen (HTML).
 * Usage: node scripts/verify-community-025-ui.mjs
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

const CHECKS = [
  {
    path: "/community/rocket-league-ssl",
    name: "Community + Level",
    any: ["Diamant", "Diamond", "community_level", "Level", "Bronze", "Platin"],
  },
  {
    path: "/community/rocket-league-ssl",
    name: "Community-Fokus",
    any: ["Coaching", "Fokus", "focus", "Analyse", "Turniere"],
  },
  {
    path: "/community/rocket-league-ssl?tab=members",
    name: "Mitgliederbereich",
    any: ["Mitglieder", "Team", "Creator", "Moderator", "Experte", "VIP"],
  },
  {
    path: "/community/rocket-league-ssl/event/demo-ev-rl-1",
    name: "Event-Route",
    any: ["SSL Community Cup", "Event"],
  },
  {
    path: "/community/rocket-league-ssl/group/einzelcoaching",
    name: "Service-Route",
    any: ["Einzelcoaching", "Buchen", "Service"],
  },
];

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const base = env.E2E_BASE_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  console.log(`\n=== Community 025 UI Check (${base}) ===\n`);

  let failed = 0;
  for (const check of CHECKS) {
    const url = `${base}${check.path}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const html = await res.text();
      const okStatus = res.status === 200;
      const okContent = check.any.some((s) => html.includes(s));
      const icon = okStatus && okContent ? "✓" : "✗";
      console.log(
        `${icon} ${check.name}: HTTP ${res.status}${okContent ? "" : ` (erwartet eines von: ${check.any.join(", ")})`}`,
      );
      if (!okStatus || !okContent) failed++;
    } catch (e) {
      console.log(`✗ ${check.name}: ${e.message}`);
      failed++;
    }
  }

  console.log("");
  if (failed) {
    console.error(`${failed} Check(s) fehlgeschlagen.\n`);
    process.exit(1);
  }
  console.log("UI-Checks bestanden (Hinweis: ohne Migration 025 können Werte aus Demo-Mocks kommen).\n");
}

main();

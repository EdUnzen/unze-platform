#!/usr/bin/env node
/**
 * Pilot-Abschluss: Owner-Zugriff + Routen-Smoke
 * Usage: npm run test:pilot
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const REPORT = join(root, "docs", "sprints", "PILOT_START_REPORT.md");
const BASE = process.env.E2E_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.unze.app";
const OWNER_USERNAME = "edudemo";

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

/** @type {Array<{area:string, ok:boolean, note:string}>} */
const results = [];

function record(area, ok, note) {
  results.push({ area, ok, note });
  console.log(`${ok ? "✓" : "✗"} ${area}: ${note}`);
}

async function checkRoute(path, expectStatus) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return res.status === expectStatus || (expectStatus === 200 && res.status === 307);
}

async function main() {
  console.log("\n=== UNZE Pilot Abschlusstest ===\n");

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const admin = createClient(url, key);
    const { data: owner } = await admin
      .from("profiles")
      .select("username, platform_role")
      .eq("username", OWNER_USERNAME)
      .maybeSingle();
    record(
      "Owner-Profil",
      owner?.platform_role === "owner" || owner?.platform_role === "platform_admin",
      owner
        ? `@${owner.username} → ${owner.platform_role}`
        : `@${OWNER_USERNAME} nicht gefunden — npm run assign:owner -- ${OWNER_USERNAME}`,
    );

    const { data: others } = await admin
      .from("profiles")
      .select("username, platform_role")
      .in("platform_role", ["owner", "platform_admin"])
      .neq("username", OWNER_USERNAME);

    record(
      "Owner exklusiv",
      (others ?? []).length === 0,
      others?.length
        ? `Weitere Owner: ${others.map((o) => o.username).join(", ")}`
        : "Kein weiterer Owner/Admin",
    );
  } else {
    record("Supabase", false, "Credentials fehlen — Owner-DB-Check übersprungen");
  }

  try {
    const ownerRes = await fetch(`${BASE}/owner`, { redirect: "manual" });
    record(
      "/owner ohne Login",
      ownerRes.status === 307 || ownerRes.status === 302,
      `HTTP ${ownerRes.status} (Redirect erwartet)`,
    );
  } catch (e) {
    record("/owner ohne Login", false, e.message);
  }

  for (const [path, name] of [
    ["/", "Home"],
    ["/discover", "Discover"],
    ["/community/rocket-league-ssl", "Community"],
    ["/auth/login", "Login"],
  ]) {
    try {
      const res = await fetch(`${BASE}${path}`);
      record(name, res.status === 200, `HTTP ${res.status}`);
    } catch (e) {
      record(name, false, e.message);
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  mkdirSync(join(root, "docs", "sprints"), { recursive: true });
  writeFileSync(
    REPORT,
    `# Pilot Start Report

**Datum:** ${new Date().toISOString().slice(0, 10)}  
**Base URL:** ${BASE}

| Bereich | Status | Notiz |
|---------|--------|-------|
${results.map((r) => `| ${r.area} | ${r.ok ? "✓" : "✗"} | ${r.note} |`).join("\n")}

${failed === 0 ? "**Pilot-Start bereit.**" : `**${failed} Punkt(e) prüfen.**`}
`,
    "utf8",
  );
  console.log(`\n→ ${REPORT}\n`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

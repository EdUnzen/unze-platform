#!/usr/bin/env node
/**
 * Architektur-Audit: Marketing/Plattform-Trennung, Bundles, Domain-Routing.
 * Usage: npm run audit:architecture
 */
import { readFile, readdir, stat, writeFile, mkdir } from "fs/promises";
import { join, relative } from "path";
import { existsSync } from "fs";

const root = process.cwd();

const MARKETING_PATHS = [
  "components/landing",
  "lib/marketing",
  "app/communities",
  "app/events",
  "app/services",
  "app/studio",
  "app/impressum",
  "app/datenschutz",
  "app/kontakt",
  "app/business",
  "app/agb",
  "app/api/public",
];

const FORBIDDEN_MARKETING_IMPORTS = [
  "@/components/dashboard",
  "@/components/creator",
  "@/services/monetization",
  "@/services/stripe",
  "stripe",
  "@/components/pwa",
  "@/components/billing",
];

const DOMAINS = [
  { name: "www.unze.app", url: "https://www.unze.app" },
  { name: "unze.app", url: "https://unze.app" },
  { name: "www.unzeconnect.app", url: "https://www.unzeconnect.app" },
  { name: "unzeconnect.app", url: "https://unzeconnect.app" },
];

async function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      await walkFiles(p, acc);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

async function scanMarketingImports() {
  const violations = [];
  for (const rel of MARKETING_PATHS) {
    const dir = join(root, rel);
    const files = await walkFiles(dir);
    for (const file of files) {
      const content = await readFile(file, "utf8");
      for (const forbidden of FORBIDDEN_MARKETING_IMPORTS) {
        if (content.includes(forbidden)) {
          violations.push({ file: relative(root, file), forbidden });
        }
      }
      if (
        content.includes('@/services/') &&
        !content.includes("@/lib/marketing") &&
        !file.includes("public-directory.service")
      ) {
        const serviceImport = content.match(/from "@\/services\/[^"]+"/);
        if (serviceImport) {
          violations.push({
            file: relative(root, file),
            forbidden: serviceImport[0],
          });
        }
      }
    }
  }
  return violations;
}

async function analyzeBuildOutput() {
  const nextDir = join(root, ".next");
  if (!existsSync(nextDir)) return null;

  const chunksDir = join(nextDir, "static", "chunks");
  if (!existsSync(chunksDir)) return null;

  const files = await walkFiles(chunksDir);
  const chunks = [];
  for (const f of files) {
    const s = await stat(f);
    if (f.endsWith(".js")) {
      chunks.push({ file: relative(root, f), kb: Math.round(s.size / 1024) });
    }
  }
  chunks.sort((a, b) => b.kb - a.kb);
  return chunks.slice(0, 15);
}

async function probeDomain({ name, url }) {
  const results = [];
  const paths = name.includes("unze.app")
    ? ["/", "/communities", "/discover"]
    : ["/", "/discover", "/dashboard"];

  for (const path of paths) {
    try {
      const res = await fetch(`${url}${path}`, { redirect: "manual" });
      const location = res.headers.get("location") ?? "";
      const body = res.status === 200 ? (await res.text()).slice(0, 500) : "";
      const isLanding = body.includes("Finde deine Community") || body.includes("Entdecke Communities");
      const isPlatform = body.includes("Discover") || body.includes("UNZE");
      results.push({
        path,
        status: res.status,
        redirect: location || null,
        type: isLanding ? "landing" : isPlatform ? "platform" : "unknown",
      });
    } catch (err) {
      results.push({ path, error: err.message });
    }
  }
  return { domain: name, url, results };
}

async function main() {
  console.log("\n=== UNZE Architektur-Audit ===\n");

  console.log("--- Marketing Import-Scan ---");
  const violations = await scanMarketingImports();
  if (violations.length === 0) {
    console.log("OK Keine verbotenen Plattform-Imports in Marketing-Bereich");
  } else {
    for (const v of violations) {
      console.log(`FEHLER ${v.file}: ${v.forbidden}`);
    }
  }

  console.log("\n--- Build-Chunks (Top 15) ---");
  const chunks = await analyzeBuildOutput();
  if (chunks) {
    for (const c of chunks) {
      console.log(`  ${c.kb} KB  ${c.file}`);
    }
  } else {
    console.log("  (kein Build � npm run build zuerst ausfuehren)");
  }

  console.log("\n--- Domain-Probes ---");
  const domainResults = [];
  for (const d of DOMAINS) {
    const r = await probeDomain(d);
    domainResults.push(r);
    console.log(`\n${d.name}:`);
    for (const p of r.results) {
      if (p.error) {
        console.log(`  ${p.path}: FEHLER ${p.error}`);
      } else if (p.redirect) {
        console.log(`  ${p.path}: ${p.status} -> ${p.redirect}`);
      } else {
        console.log(`  ${p.path}: ${p.status} (${p.type})`);
      }
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    importViolations: violations,
    topChunks: chunks,
    domains: domainResults,
    passed: violations.length === 0,
  };

  const outDir = join(root, "docs", "migration");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, "ARCHITECTURE_AUDIT_REPORT.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log("\nReport: docs/migration/ARCHITECTURE_AUDIT_REPORT.json");
  if (!report.passed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

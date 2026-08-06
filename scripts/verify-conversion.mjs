#!/usr/bin/env node
/**
 * Abnahme: Conversion — CTAs, Formulare, Preise, Analyse-Gutschrift.
 * Usage: npm run verify:conversion [--url=https://www.unze.app]
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv.find((a) => a.startsWith("--url="))?.slice(6) ?? "https://www.unze.app";

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function check(name, pass) {
  checks.push({ name, pass });
}

function countInDir(dir, needle) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) n += countInDir(p, needle);
    else if (/\.tsx$/.test(name) && readFileSync(p, "utf8").includes(needle)) n++;
  }
  return n;
}

const analyseLinks = countInDir(join(root, "components/business"), "/business/analyse");
const kontaktLinks = countInDir(join(root, "components/business"), "/business/kontakt");
const premiumCtaUses = countInDir(join(root, "components/business"), "PremiumCta");

let ctaHref = "";
try {
  ctaHref = readFileSync(join(root, "lib/constants/business-site.ts"), "utf8");
} catch {
  /* skip */
}
check("BUSINESS_CTA_HREF → Analyse", ctaHref.includes('BUSINESS_CTA_HREF = "/business/analyse"'));
check("CTA-Links Analyse + Kontakt + PremiumCta (≥5)", analyseLinks + kontaktLinks + premiumCtaUses >= 5);

check("PremiumCta.tsx vorhanden", statSync(join(root, "components/business/visuals/PremiumCta.tsx"), { throwIfNoEntry: false }) != null);
check("BusinessProjectInquiryForm.tsx", statSync(join(root, "components/business/BusinessProjectInquiryForm.tsx"), { throwIfNoEntry: false }) != null);
check(
  "Anfrage-Erfolgsseite",
  statSync(join(root, "app/(business)/business/anfrage/erfolg/page.tsx"), { throwIfNoEntry: false }) != null,
);

try {
  const pricing = readFileSync(join(root, "lib/constants/business-pricing-policy.ts"), "utf8");
  check("Preis-CTA definiert", pricing.includes("CTA") || pricing.includes("cta"));
  check("Analyse-Gutschrift kommuniziert", pricing.includes("100 %"));
} catch {
  check("business-pricing-policy.ts", false);
}

try {
  const cta = readFileSync(join(root, "lib/constants/cta-copy.ts"), "utf8");
  check("CTA: Projekt anfragen / Kontakt", cta.includes("CTA_PROJECT_INQUIRY") || cta.includes("Projekt anfragen"));
} catch {
  check("cta-copy.ts", false);
}

try {
  const inquiryCopy = readFileSync(join(root, "lib/constants/business-copy.ts"), "utf8");
  check("Anfrage submitLabel in business-copy", inquiryCopy.includes('submitLabel: "Anfrage senden"'));
} catch {
  check("business-copy inquiry submitLabel", false);
}

async function liveConversion(path, needles) {
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`);
    const html = await res.text();
    for (const n of needles) {
      check(`${path} enthält „${n}"`, html.includes(n));
    }
  } catch {
    check(`${path} live conversion`, false);
  }
}

await liveConversion("/business", ["Analyse starten", "Projekt besprechen", "/business/analyse"]);
await liveConversion("/business/kontakt", ["Projektanfrage", "E-Mail", "form"]);

let allPass = true;
console.log(`verify:conversion — ${base}\n`);
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

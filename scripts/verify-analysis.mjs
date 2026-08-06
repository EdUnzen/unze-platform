#!/usr/bin/env node
/**
 * Abnahme: Analyse Core, Demo-Standard, Preisrichtlinien.
 * Usage: npm run verify:analysis
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".next", ".git", "_tmp", "legal-content.ts"]);

const REQUIRED_DEMO = [
  "Muster Logistics GmbH",
  "NordCargo GmbH",
  "Rhein Transport GmbH",
  "Atlas Services GmbH",
  "Alpha Digital Solutions",
  "GreenBuild Handwerk",
  "Muster Consulting",
  "Beispiel E-Commerce GmbH",
];

const REPORT_SECTIONS = [
  "Website-Analyse",
  "SEO",
  "Performance",
  "Benutzerfreundlichkeit",
  "Marketing",
  "Automatisierung",
  "KI-Potenzial",
  "Digitalisierungsgrad",
  "Roadmap",
  "Handlungsempfehlungen",
  "Maßnahmenplan",
];

const FORBIDDEN = [/Becker Logistik/i, /beckerlog\.de/i];

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function check(name, pass) {
  checks.push({ name, pass });
}

try {
  const demo = read("lib/constants/demo-companies.ts");
  for (const c of REQUIRED_DEMO) {
    check(`Demo-Firma: ${c}`, demo.includes(c));
  }
  for (const s of REPORT_SECTIONS) {
    check(`Berichts-Bereich: ${s}`, demo.includes(s));
  }
  check("Demo-Disclaimer vorhanden", demo.includes("DEMO_DATA_DISCLAIMER"));
} catch {
  check("demo-companies.ts lesbar", false);
}

try {
  const pricing = read("lib/constants/business-pricing-policy.ts");
  check('Preis-Grundsatz "ab"', pricing.includes('"ab"') || pricing.includes("'ab'"));
  check("Einstiegspreis-Text", pricing.includes("Einstiegspreis"));
  check("Kalkulationsfaktoren", pricing.includes("Projektumfang"));
  check("Analyse-Gutschrift", pricing.includes("100 %"));
} catch {
  check("business-pricing-policy.ts lesbar", false);
}

function walkPublicBusiness(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkPublicBusiness(p);
    else if (/\.(tsx|ts)$/.test(name) && !name.includes("legal")) {
      const text = readFileSync(p, "utf8");
      for (const re of FORBIDDEN) {
        if (re.test(text)) {
          check(`Kein Pilotname in ${p.replace(root + "\\", "")}`, false);
        }
      }
    }
  }
}

walkPublicBusiness(join(root, "components/business"));
walkPublicBusiness(join(root, "lib/constants"));

const pilotFails = checks.filter((c) => !c.pass && c.name.startsWith("Kein Pilotname"));
check("Keine Pilotnamen in Business-Code", pilotFails.length === 0);

check("Analyse Core Copy in business-copy", read("lib/constants/business-copy.ts").includes("Business Core"));

try {
  const tiers = read("lib/constants/business-analysis-tiers.ts");
  check("Analyse-Stufen: Quick", tiers.includes("Quick Analyse"));
  check("Analyse-Stufen: Business", tiers.includes("Business Analyse"));
  check("Analyse-Stufen: Premium", tiers.includes("Premium Analyse"));
  check("Analyse-Preise Quick", tiers.includes("59,90 €"));
  check("Analyse-Preise Business", tiers.includes("ab 249 €"));
  check("Analyse-Preise Premium", tiers.includes("ab 490 €"));
  check("Einstiegspreis-Hinweis", tiers.includes("Abhängig von Umfang und Unternehmensgröße"));
  check("Gutschrift-Badge Business", tiers.includes("100 % Gutschrift bei Auftrag"));
  check("Analyse-Workflow 8 Schritte", tiers.includes("ANALYSIS_WORKFLOW_STEPS"));
  check("Transparenz-Kategorien", tiers.includes('label: "Beobachtung"'));
} catch {
  check("business-analysis-tiers.ts lesbar", false);
}

try {
  const copy = read("lib/constants/business-copy.ts");
  check("Analyse-Copy Stufen", copy.includes("Quick Analyse") && copy.includes("Premium Analyse"));
  check("Analyse href /business/analyse", copy.includes('href: "/business/analyse"'));
  check("Startseite Analyse-Promo", copy.includes("analysisPromo"));
  check("Analyse starten CTA", copy.includes("Analyse starten"));
} catch {
  check("business-copy Analyse-Abschnitt", false);
}

try {
  const site = read("lib/constants/business-site.ts");
  const analyseIdx = site.indexOf('label: "Analyse"');
  const leistungenIdx = site.indexOf('label: "Leistungen"');
  check("Nav: Analyse vor Leistungen", analyseIdx > 0 && analyseIdx < leistungenIdx);
  const navBlock = site.split("BUSINESS_NAV = [")[1]?.split("] as const")[0] ?? "";
  check("Nav: max. 10 Hauptpunkte", (navBlock.match(/label:/g) || []).length === 10);
  check("Nav: Apps kurz", site.includes('label: "Apps"') && !site.includes("Apps (Web & Mobile)"));
  check("Nav: Branchen kurz", site.includes('label: "Branchen"'));
  check("Nav: Service kurz", site.includes('label: "Service"'));
  check("Nav: KI nicht in Hauptnav", !navBlock.includes("KI & Automatisierung"));
  check("Nav: Produkte sekundär", site.includes("BUSINESS_NAV_SECONDARY"));
  check("Nav: Analyse emphasis", site.includes("emphasis: true"));
} catch {
  check("business-site.ts Nav", false);
}

let allPass = true;
console.log("verify:analysis\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

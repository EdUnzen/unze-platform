#!/usr/bin/env node
/**
 * Abnahme: Design — Premium-Komponenten, Copy-Vollständigkeit, Encoding.
 * Usage: npm run verify:design
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_COMPONENTS = [
  "components/business/visuals/PremiumCta.tsx",
  "components/business/visuals/IndustryModuleShowcase.tsx",
  "components/business/BusinessUi.tsx",
  "components/business/pages/BusinessCorePage.tsx",
  "components/business/pages/BusinessStartPage.tsx",
  "components/business/pages/BusinessProduktePage.tsx",
  "components/business/visuals/IndustryTemplateShowcase.tsx",
  "components/business/visuals/BusinessDevelopmentPortfolio.tsx",
  "components/business/visuals/previews/CommunityPreview.tsx",
  "lib/constants/unze-ecosystem-nav.ts",
  "lib/constants/business-copy.ts",
  "lib/constants/business-own-products.ts",
  "lib/constants/business-industry-scenarios.ts",
  "lib/constants/cta-copy.ts",
];

const BUSINESS_ROUTES = [
  "app/(business)/business/page.tsx",
  "app/(business)/business/business-core/page.tsx",
  "app/(business)/business/preise/page.tsx",
  "app/(business)/business/servicepakete/page.tsx",
  "app/(business)/business/kontakt/page.tsx",
  "app/(business)/business/analyse/page.tsx",
  "app/(business)/business/produkte/page.tsx",
];

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

for (const rel of REQUIRED_COMPONENTS) {
  checks.push({ name: `Komponente ${rel}`, pass: existsSync(join(root, rel)) });
}

for (const rel of BUSINESS_ROUTES) {
  checks.push({ name: `Route ${rel}`, pass: existsSync(join(root, rel)) });
}

try {
  const copy = readFileSync(join(root, "lib/constants/business-copy.ts"), "utf8");
  for (const key of ["start", "businessCore", "preise", "servicepakete", "kontakt", "produkte"]) {
    checks.push({ name: `business-copy.${key}`, pass: copy.includes(`${key}:`) });
  }
  checks.push({
    name: "Preise: Orientierung + ab-Preise",
    pass:
      copy.includes("Orientierung — klar und marktgerecht") &&
      (copy.includes("ab 39,90 €") || copy.includes("Template ab")),
  });
  const ownProducts = readFileSync(join(root, "lib/constants/business-own-products.ts"), "utf8");
  checks.push({
    name: "Eigene Produkte: UNZE Connect + My Organizer AI",
    pass: ownProducts.includes("unze-connect") && ownProducts.includes("my-organizer-ai"),
  });
  const businessHeader = readFileSync(join(root, "components/business/BusinessHeader.tsx"), "utf8");
  const ecosystemNav = readFileSync(join(root, "lib/constants/unze-ecosystem-nav.ts"), "utf8");
  const landingCopy = readFileSync(join(root, "lib/constants/landing-copy.ts"), "utf8");
  checks.push({
    name: "Ökosystem-Navigation: Business-Header + Community-Link",
    pass:
      businessHeader.includes("UNZE Business") &&
      businessHeader.includes("CommunityExitLink") &&
      landingCopy.includes('"UNZE Business"'),
  });
  checks.push({
    name: "Community-Exit zeigt auf Plattform-Startseite (/)",
    pass:
      ecosystemNav.includes("UNZE_COMMUNITY_HREF = UNZE_BRAND_HREF") ||
      ecosystemNav.includes('UNZE_COMMUNITY_HREF = "/"'),
  });
  checks.push({
    name: "App-UI Referenzen: Community + Admin + Profile",
    pass:
      existsSync(join(root, "components/business/visuals/previews/CommunityPreview.tsx")) &&
      existsSync(join(root, "components/business/visuals/previews/AdminPreview.tsx")) &&
      existsSync(join(root, "components/business/visuals/previews/ProfilePreview.tsx")),
  });
} catch {
  checks.push({ name: "business-copy.ts", pass: false });
}

const utf8 = spawnSync("node", ["scripts/check-utf8.mjs"], { cwd: root, encoding: "utf8" });
checks.push({ name: "UTF-8 check", pass: utf8.status === 0 });

const uni = spawnSync("node", ["scripts/fix-unicode-escapes.mjs", "--check"], {
  cwd: root,
  encoding: "utf8",
});
checks.push({ name: "Unicode-Escapes check", pass: uni.status === 0 });

let allPass = true;
console.log("verify:design\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

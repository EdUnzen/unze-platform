#!/usr/bin/env node
/**
 * Abnahme: Barrierefreiheit — ARIA, Formulare, FAQ.
 * Usage: npm run verify:accessibility
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function check(name, pass) {
  checks.push({ name, pass });
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

check("BusinessFaqAccordion.tsx", existsSync(join(root, "components/business/BusinessFaqAccordion.tsx")));

try {
  const faq = read("components/business/BusinessFaqAccordion.tsx");
  check("FAQ: aria-expanded", faq.includes("aria-expanded"));
} catch {
  check("FAQ accessibility", false);
}

try {
  const inquiry = read("components/business/BusinessProjectInquiryForm.tsx");
  check("Kontaktformular: Labels/Inputs", inquiry.includes("<label") || inquiry.includes("htmlFor"));
  check("Kontaktformular: Honeypot (Spam)", inquiry.includes('name="website"'));
} catch {
  check("BusinessProjectInquiryForm.tsx", false);
}

try {
  const quick = read("components/business/BusinessQuickInquiryForm.tsx");
  check("Quick-Inquiry: E-Mail-Feld", quick.includes("email") || quick.includes("Email"));
} catch {
  check("BusinessQuickInquiryForm.tsx", false);
}

try {
  const header = read("components/business/BusinessHeader.tsx");
  check("Header: Navigation Links", header.includes("href") || header.includes("Link"));
} catch {
  check("BusinessHeader.tsx", false);
}

try {
  const ui = read("components/business/BusinessUi.tsx");
  check("CTA-Buttons: min. Touch-Target Hinweis", ui.includes("min-h-") || ui.includes("py-3"));
} catch {
  check("BusinessUi.tsx", false);
}

let decorativeAria = 0;
for (const rel of [
  "components/business/pages/BusinessStartPage.tsx",
  "components/business/BusinessFaqAccordion.tsx",
]) {
  try {
    decorativeAria += (read(rel).match(/aria-hidden/g) ?? []).length;
  } catch {
    /* skip */
  }
}
check("Dekorative Icons: aria-hidden", decorativeAria >= 2);

let allPass = true;
console.log("verify:accessibility\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

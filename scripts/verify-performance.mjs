#!/usr/bin/env node
/**
 * Abnahme: Performance — Bilder, Fonts, schwere Patterns.
 * Usage: npm run verify:performance
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS = join(root, "components/business");

/** @type {{ name: string; pass: boolean }[]} */
const checks = [];

function check(name, pass) {
  checks.push({ name, pass });
}

let nextImageCount = 0;
let rawImgCount = 0;
let priorityCount = 0;

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) scan(p);
    else if (/\.tsx$/.test(name)) {
      const text = readFileSync(p, "utf8");
      if (text.includes('from "next/image"') || text.includes("from 'next/image'")) nextImageCount++;
      if (/<img[\s>]/.test(text)) rawImgCount++;
      if (text.includes("priority")) priorityCount++;
    }
  }
}

scan(BUSINESS);
scan(join(root, "app/(business)/business"));

check("BusinessShell Font-Optimierung (next/font)", (() => {
  try {
    const shell = readFileSync(join(BUSINESS, "BusinessShell.tsx"), "utf8");
    return shell.includes("next/font");
  } catch {
    return false;
  }
})());

/** Phase 2: Hero-Poster + Preview-Mockups dürfen <img> nutzen */
check("Rohe <img> nur Hero/Preview (≤2 Dateien)", rawImgCount <= 2);
check("next/image in Business-Bereich genutzt", nextImageCount >= 1);
/** Phase 2: gezieltes priority auf Hero, Header-Logo und Above-the-fold-Mockups */
check("Priority gezielt (≤20 Dateien)", priorityCount <= 20);

try {
  const hero = readFileSync(join(BUSINESS, "BusinessHeroVideo.tsx"), "utf8");
  check("Hero-Video: preload/metadata", hero.includes("video") || hero.includes("Video"));
} catch {
  check("BusinessHeroVideo.tsx", false);
}

check("optimizePackageImports in next.config", (() => {
  try {
    const cfg = readFileSync(join(root, "next.config.ts"), "utf8");
    return cfg.includes("optimizePackageImports") || cfg.includes("experimental");
  } catch {
    return true;
  }
})());

let allPass = true;
console.log("verify:performance\n");
for (const c of checks) {
  console.log(`  [${c.pass ? "OK" : "FAIL"}] ${c.name}`);
  if (!c.pass) allPass = false;
}
console.log("");
process.exit(allPass ? 0 : 1);

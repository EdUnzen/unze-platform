#!/usr/bin/env node
/**
 * Screenshots echter Templates Business Core (TBC Studio :3100)
 *
 * Usage:
 *   npm run marketing:capture:tbc
 *   node scripts/marketing/capture-tbc-templates.mjs --template=reinigung
 *
 * Env:
 *   TBC_BASE=http://localhost:3100
 */
import { mkdir } from "fs/promises";
import { join } from "path";
import { launchBrowser, hideNextDevIndicators } from "./browser.mjs";

const TBC_BASE = process.env.TBC_BASE ?? "http://localhost:3100";
const OUT_ROOT = join(process.cwd(), "public", "media", "business-core", "screenshots");

const CAPTURES = [
  { template: "umzug", page: "home", route: "/umzug" },
  { template: "umzug", page: "kontakt", route: "/umzug/kontakt" },
  { template: "reinigung", page: "home", route: "/reinigung" },
  { template: "reinigung", page: "kontakt", route: "/reinigung/kontakt" },
  { template: "hausmeister", page: "home", route: "/hausmeister" },
  { template: "hausmeister", page: "kontakt", route: "/hausmeister/kontakt" },
  { template: "arztpraxis", page: "home", route: "/arztpraxis" },
  { template: "arztpraxis", page: "kontakt", route: "/arztpraxis/kontakt" },
];

const VIEWPORT = { width: 1280, height: 800 };

function parseArgs(argv) {
  const opts = { template: null };
  for (const arg of argv) {
    if (arg.startsWith("--template=")) opts.template = arg.slice("--template=".length);
  }
  return opts;
}

async function waitForStudio(page) {
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let targets = CAPTURES;
  if (opts.template) {
    targets = CAPTURES.filter((c) => c.template === opts.template);
  }

  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    locale: "de-DE",
  });
  const page = await context.newPage();

  console.log(`TBC Capture — base ${TBC_BASE}`);

  for (const target of targets) {
    const url = new URL(target.route, TBC_BASE).toString();
    const outDir = join(OUT_ROOT, target.template);
    const outFile = join(outDir, `${target.page}.png`);

    await mkdir(outDir, { recursive: true });

    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      if (!res?.ok()) {
        console.warn(`  SKIP ${target.template}/${target.page} — HTTP ${res?.status()}`);
        continue;
      }
      await waitForStudio(page);
      await hideNextDevIndicators(page);
      await page.screenshot({ path: outFile, type: "png", fullPage: false });
      console.log(`  OK  ${target.template}/${target.page}.png`);
    } catch (err) {
      console.warn(`  FAIL ${target.template}/${target.page}:`, err.message);
    }
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

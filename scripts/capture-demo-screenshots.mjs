#!/usr/bin/env node
/**
 * Mobile-Viewport-Screenshots der Demo-Routen.
 * Voraussetzung: Dev-Server läuft (npm run dev).
 */
import { mkdir } from "fs/promises";
import { join } from "path";
import { chromium } from "playwright";

const root = process.cwd();
const outDir = join(root, "docs", "testing", "screenshots");
const base = process.env.E2E_BASE_URL ?? "http://localhost:3002";

const ROUTES = [
  { file: "01-home.png", path: "/" },
  { file: "02-discover.png", path: "/discover" },
  { file: "03-community-rocket-league.png", path: "/community/rocket-league-ssl" },
  { file: "04-community-business.png", path: "/community/business-circle-dach" },
  { file: "05-community-creator.png", path: "/community/creator-lounge" },
  { file: "06-community-feed-tab.png", path: "/community/rocket-league-ssl?tab=feed" },
  { file: "07-discover-events.png", path: "/discover?tab=events" },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  let failed = 0;
  for (const route of ROUTES) {
    const page = await context.newPage();
    const url = `${base}${route.path}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(outDir, route.file),
        fullPage: true,
      });
      console.log(`✓ ${route.file}`);
    } catch (err) {
      console.error(`✗ ${route.file}: ${err.message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  if (failed) {
    console.error(`\n${failed} Screenshot(s) fehlgeschlagen. Server auf ${base}?\n`);
    process.exit(1);
  }
  console.log(`\nScreenshots in docs/testing/screenshots/\n`);
}

main();

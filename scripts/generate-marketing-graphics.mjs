#!/usr/bin/env node
/**
 * Marketing-Grafiken aus HTML-Templates (Hero, Social 9:16, LinkedIn, Mockups).
 * Usage: npm run marketing:graphics
 */
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const templatesDir = join(root, "docs", "marketing", "templates");
const outDir = join(root, "docs", "marketing", "graphics");

const EXPORTS = [
  { template: "hero-creator-beta.html", out: "hero-creator-beta-1920x1080.png", width: 1920, height: 1080 },
  { template: "social-story-creator.html", out: "social-story-creator-1080x1920.png", width: 1080, height: 1920 },
  { template: "social-story-crowd-partner.html", out: "social-story-crowd-partner-1080x1920.png", width: 1080, height: 1920 },
  { template: "social-linkedin-creator.html", out: "social-linkedin-creator-1200x627.png", width: 1200, height: 627 },
  { template: "social-facebook-creator.html", out: "social-facebook-creator-1200x630.png", width: 1200, height: 630 },
  { template: "mockup-iphone-home.html", out: "mockup-iphone-home.png", width: 900, height: 1800 },
  { template: "mockup-tablet-discover.html", out: "mockup-tablet-discover.png", width: 1200, height: 1600 },
  { template: "mockup-desktop-dashboard.html", out: "mockup-desktop-dashboard.png", width: 1600, height: 1000 },
  { template: "carousel-slide-01.html", out: "carousel-01-communities.png", width: 1080, height: 1080 },
  { template: "carousel-slide-02.html", out: "carousel-02-zertifikate.png", width: 1080, height: 1080 },
  { template: "carousel-slide-03.html", out: "carousel-03-crowd-partner.png", width: 1080, height: 1080 },
];

async function launchBrowser() {
  const { chromium } = await import("playwright");
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch {
      continue;
    }
  }
  throw new Error("Kein Browser ù bitte `npx playwright install chromium` ausfùhren");
}

async function main() {
  console.log("\n=== UNZE Marketing Graphics ===\n");
  await mkdir(outDir, { recursive: true });

  const browser = await launchBrowser();
  const page = await browser.newPage();

  let failed = 0;
  for (const item of EXPORTS) {
    const htmlPath = join(templatesDir, item.template);
    if (!existsSync(htmlPath)) {
      console.error(`? Template fehlt: ${item.template}`);
      failed++;
      continue;
    }
    const html = await readFile(htmlPath, "utf8");
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const outPath = join(outDir, item.out);
    await page.screenshot({ path: outPath, type: "png" });
    console.log(`? ${item.out}`);
  }

  await browser.close();
  console.log(`\n? ${outDir}\n`);
  if (failed) process.exit(1);
}

main();

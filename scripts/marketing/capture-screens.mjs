#!/usr/bin/env node
/**
 * Saubere App-Captures f\u00fcr Marketing-Mockups (Viewport, kein Onboarding).
 * Usage: npm run marketing:capture
 */
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { launchBrowser, createMarketingContext, preparePage } from "./browser.mjs";
import { CAPTURE_ROUTES, dirs, base, demoEmail, demoPassword } from "./config.mjs";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

async function tryLogin(page) {
  await page.goto(`${base}/auth/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const email = page.locator('input[type="email"], input[name="email"], #email').first();
  const password = page.locator('input[type="password"], input[name="password"], #password').first();
  if (!(await email.count())) return false;
  await email.fill(demoEmail);
  await password.fill(demoPassword);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3500);
  return !page.url().includes("/auth/login");
}

async function dismissOverlays(page) {
  const selectors = [
    '[data-testid="onboarding-dismiss"]',
    'button:has-text("Schlie\u00dfen")',
    'button:has-text("Sp\u00e4ter")',
    'button:has-text("Verstanden")',
    '[aria-label="Schlie\u00dfen"]',
  ];
  for (const sel of selectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 300 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
    }
  }
}

async function captureRoute(page, route, viewport) {
  const url = `${base}${route.path}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await page.waitForTimeout(500);

  const suffix = viewport === "desktop" ? "-desktop" : "";
  const file = join(dirs.raw, `${route.id}${suffix}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  \u2713 ${route.id}${suffix}`);
  return file;
}

async function main() {
  await mkdir(dirs.raw, { recursive: true });
  const browser = await launchBrowser();

  const mobileCtx = await createMarketingContext(browser, { ...MOBILE, mobile: true });
  const mobilePage = await mobileCtx.newPage();
  await preparePage(mobilePage);

  const desktopCtx = await createMarketingContext(browser, { ...DESKTOP, mobile: false });
  const desktopPage = await desktopCtx.newPage();
  await preparePage(desktopPage);

  const loggedInMobile = await tryLogin(mobilePage);
  const loggedInDesktop = await tryLogin(desktopPage);
  if (!loggedInMobile || !loggedInDesktop) {
    console.warn("Warnung: Login fehlgeschlagen \u2014 Auth-Routen k\u00f6nnen leer sein.");
  }

  const manifest = { capturedAt: new Date().toISOString(), base, files: [] };

  for (const route of CAPTURE_ROUTES) {
    const page = route.auth ? mobilePage : mobilePage;
    if (route.auth && !loggedInMobile) continue;
    try {
      const file = await captureRoute(page, route, "mobile");
      manifest.files.push({ id: route.id, path: file, viewport: "mobile" });
    } catch (err) {
      console.error(`  \u2717 ${route.id}: ${err.message}`);
    }
  }

  const desktopRoutes = ["discover", "dashboard", "community-gaming"];
  for (const id of desktopRoutes) {
    const route = CAPTURE_ROUTES.find((r) => r.id === id);
    if (!route) continue;
    if (route.auth && !loggedInDesktop) continue;
    try {
      const file = await captureRoute(desktopPage, route, "desktop");
      manifest.files.push({ id: `${route.id}-desktop`, path: file, viewport: "desktop" });
    } catch (err) {
      console.error(`  \u2717 ${id}-desktop: ${err.message}`);
    }
  }

  await writeFile(join(dirs.raw, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  await browser.close();
  console.log(`\nCaptures: ${manifest.files.length} Dateien in docs/marketing/raw-screens/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

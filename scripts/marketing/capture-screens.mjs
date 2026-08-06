#!/usr/bin/env node
/**
 * Saubere App-Captures im Marketing-Modus (Mobile, Desktop, iPad).
 * Usage: npm run marketing:capture
 */
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
  launchBrowser,
  createMarketingContext,
  prepareMarketingPage,
  assertNoOverlays,
} from "./browser.mjs";
import { marketingUrl } from "./marketing-url.mjs";
import { CAPTURE_ROUTES, dirs, base, demoEmail, demoPassword } from "./config.mjs";

const VIEWPORTS = {
  mobile: { width: 390, height: 844, mobile: true },
  desktop: { width: 1440, height: 900, mobile: false },
  ipad: { width: 820, height: 1180, mobile: true },
};

const DESKTOP_ROUTE_IDS = new Set(["discover", "dashboard", "community-gaming"]);
const IPAD_ROUTE_IDS = new Set(["discover", "community-gaming", "dashboard", "home"]);

async function tryLogin(page) {
  await page.goto(marketingUrl(base, "/auth/login"), {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const email = page.locator('input[type="email"], input[name="email"], #email').first();
  const password = page.locator('input[type="password"], input[name="password"], #password').first();
  if (!(await email.count())) return false;
  await email.fill(demoEmail);
  await password.fill(demoPassword);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3500);
  return !page.url().includes("/auth/login");
}

async function captureRoute(page, route, viewportKey) {
  const url = marketingUrl(base, route.path);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);
  await assertNoOverlays(page, route.id);

  const suffix = viewportKey === "mobile" ? "" : `-${viewportKey}`;
  const file = join(dirs.raw, `${route.id}${suffix}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  \u2713 ${route.id}${suffix}`);
  return file;
}

async function captureForViewport(browser, viewportKey, routes, loggedIn) {
  const vp = VIEWPORTS[viewportKey];
  const ctx = await createMarketingContext(browser, vp);
  const page = await ctx.newPage();
  await prepareMarketingPage(page);

  if (viewportKey !== "mobile") {
    await tryLogin(page);
  }

  const files = [];
  for (const route of routes) {
    if (route.auth && !loggedIn) continue;
    try {
      const file = await captureRoute(page, route, viewportKey);
      files.push({ id: `${route.id}${viewportKey === "mobile" ? "" : `-${viewportKey}`}`, path: file, viewport: viewportKey });
    } catch (err) {
      console.error(`  \u2717 ${route.id}-${viewportKey}: ${err.message}`);
    }
  }

  await ctx.close();
  return files;
}

async function main() {
  await mkdir(dirs.raw, { recursive: true });
  const browser = await launchBrowser();

  const mobileCtx = await createMarketingContext(browser, VIEWPORTS.mobile);
  const mobilePage = await mobileCtx.newPage();
  await prepareMarketingPage(mobilePage);
  const loggedIn = await tryLogin(mobilePage);

  const manifest = { capturedAt: new Date().toISOString(), base, marketingMode: true, files: [] };

  for (const route of CAPTURE_ROUTES) {
    if (route.auth && !loggedIn) continue;
    try {
      const file = await captureRoute(mobilePage, route, "mobile");
      manifest.files.push({ id: route.id, path: file, viewport: "mobile" });
    } catch (err) {
      console.error(`  \u2717 ${route.id}: ${err.message}`);
    }
  }

  await mobileCtx.close();

  const desktopRoutes = CAPTURE_ROUTES.filter((r) => DESKTOP_ROUTE_IDS.has(r.id));
  manifest.files.push(...(await captureForViewport(browser, "desktop", desktopRoutes, loggedIn)));

  const ipadRoutes = CAPTURE_ROUTES.filter((r) => IPAD_ROUTE_IDS.has(r.id));
  manifest.files.push(...(await captureForViewport(browser, "ipad", ipadRoutes, loggedIn)));

  await writeFile(join(dirs.raw, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  await browser.close();
  console.log(`\nCaptures: ${manifest.files.length} Dateien in docs/marketing/raw-screens/marketing/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

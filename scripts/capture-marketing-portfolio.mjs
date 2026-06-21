#!/usr/bin/env node
/**
 * Marketing-Screenshot-Portfolio (Mobile, Tablet, Desktop).
 * Usage: E2E_BASE_URL=https://unze-platform.vercel.app npm run screenshots:marketing
 *
 * Optional Auth (Dashboard-Routen):
 *   DEMO_EMAIL=edubek89@icloud.com DEMO_PASSWORD=UnzeDemo2026!
 */
import { mkdir } from "fs/promises";
import { join } from "path";

const root = process.cwd();
const outRoot = join(root, "docs", "marketing", "screenshots");
const base = process.env.E2E_BASE_URL ?? "https://unze-platform.vercel.app";
const demoEmail = process.env.DEMO_EMAIL ?? "edubek89@icloud.com";
const demoPassword = process.env.DEMO_PASSWORD ?? "UnzeDemo2026!";

const VIEWPORTS = {
  mobile: { width: 390, height: 844, label: "iphone-14" },
  tablet: { width: 820, height: 1180, label: "ipad" },
  desktop: { width: 1440, height: 900, label: "desktop" },
};

const PUBLIC_ROUTES = [
  { id: "01-home", path: "/", name: "Home" },
  { id: "02-discover", path: "/discover", name: "Discover" },
  { id: "03-discover-events", path: "/discover?tab=events", name: "Discover Events" },
  { id: "04-discover-services", path: "/discover?tab=services", name: "Discover Services" },
  { id: "05-community-gaming", path: "/community/rocket-league-ssl", name: "Community Gaming" },
  { id: "06-community-code", path: "/community/code-craft-academy", name: "Community Code" },
  { id: "07-community-photo", path: "/community/lens-masters-guild", name: "Community Fotografie" },
  { id: "08-community-business", path: "/community/business-circle-dach", name: "Community Business" },
  { id: "09-crowd-partner-guest", path: "/dashboard/crowd-partner", name: "Crowd Partner" },
  { id: "10-login", path: "/auth/login", name: "Login" },
];

const AUTH_ROUTES = [
  { id: "11-dashboard", path: "/dashboard", name: "Dashboard" },
  { id: "12-members", path: "/dashboard/community/rocket-league-ssl/members", name: "Mitglieder" },
  { id: "13-requests", path: "/dashboard/community/rocket-league-ssl/requests", name: "Antr\u00e4ge" },
  { id: "14-events-dash", path: "/dashboard/community/rocket-league-ssl/events", name: "Events Dashboard" },
  { id: "15-scanner", path: "/dashboard/community/rocket-league-ssl/scanner", name: "Scanner" },
  { id: "16-auszeichnungen", path: "/dashboard/community/rocket-league-ssl/auszeichnungen", name: "Auszeichnungen" },
  { id: "17-monetization", path: "/dashboard/community/rocket-league-ssl/monetization", name: "Monetarisierung" },
  { id: "18-roles", path: "/dashboard/community/rocket-league-ssl/roles", name: "Rollen" },
  { id: "19-settings", path: "/dashboard/community/rocket-league-ssl/settings", name: "Einstellungen" },
  { id: "20-profile", path: "/profile", name: "Profil" },
  { id: "21-profile-awards", path: "/profile/auszeichnungen", name: "Profil Auszeichnungen" },
  { id: "22-profile-id", path: "/profile/id", name: "UNZE-ID" },
  { id: "23-profile-tickets", path: "/profile/tickets", name: "Tickets" },
  { id: "24-crowd-partner", path: "/dashboard/crowd-partner", name: "Crowd Partner Auth" },
];

async function tryLogin(page) {
  await page.goto(`${base}/auth/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const email = page.locator('input[type="email"], input[name="email"], #email').first();
  const password = page.locator('input[type="password"], input[name="password"], #password').first();
  if (!(await email.count())) return false;
  await email.fill(demoEmail);
  await password.fill(demoPassword);
  const submit = page.locator('button[type="submit"]').first();
  await submit.click();
  await page.waitForTimeout(3000);
  return !page.url().includes("/auth/login");
}

async function captureRoute(page, route, viewportKey, outDir) {
  const url = `${base}${route.path}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1500);
    const file = join(outDir, `${route.id}-${route.name.replace(/\s+/g, "-").toLowerCase()}.png`);
    await page.screenshot({ path: file, fullPage: viewportKey === "mobile" });
    console.log(`  ? [${viewportKey}] ${route.name}`);
    return true;
  } catch (err) {
    console.error(`  ? [${viewportKey}] ${route.name}: ${err.message}`);
    return false;
  }
}

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
  console.log(`\n=== UNZE Marketing Screenshots ===\nBase: ${base}\n`);

  const browser = await launchBrowser();
  let failed = 0;

  for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
    const outDir = join(outRoot, viewport.label);
    await mkdir(outDir, { recursive: true });
    console.log(`\n--- ${viewport.label} (${viewport.width}x${viewport.height}) ---`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: viewportKey === "mobile",
      hasTouch: viewportKey === "mobile",
    });
    const page = await context.newPage();

    for (const route of PUBLIC_ROUTES) {
      if (!(await captureRoute(page, route, viewportKey, outDir))) failed++;
    }

    const loggedIn = await tryLogin(page);
    if (loggedIn) {
      console.log("  ? Demo-Login OK");
      for (const route of AUTH_ROUTES) {
        if (!(await captureRoute(page, route, viewportKey, outDir))) failed++;
      }
    } else {
      console.warn("  ? Login fehlgeschlagen ù Dashboard-Screenshots \u00fcbersprungen");
      failed += AUTH_ROUTES.length;
    }

    await context.close();
  }

  await browser.close();
  console.log(`\n? ${outRoot}`);
  if (failed) {
    console.error(`\n${failed} Screenshot(s) fehlgeschlagen.\n`);
    process.exit(1);
  }
  console.log("\nPortfolio komplett.\n");
}

main();

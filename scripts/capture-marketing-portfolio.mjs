#!/usr/bin/env node
/**
 * Marketing- und Dokumentations-Screenshots (Mobile, Tablet, Desktop).
 *
 * Marketing: saubere UI (?marketing=1), keine Login-Screens
 * Dokumentation: Login, Onboarding-erlaubt
 *
 * Usage:
 *   npm run screenshots:marketing
 *   npm run screenshots:documentation
 */
import { mkdir } from "fs/promises";
import { join } from "path";
import {
  launchBrowser,
  createMarketingContext,
  prepareMarketingPage,
  assertNoOverlays,
} from "./marketing/browser.mjs";
import { marketingUrl } from "./marketing/marketing-url.mjs";
import { base, demoEmail, demoPassword, dirs } from "./marketing/config.mjs";

const VIEWPORTS = {
  mobile: { width: 390, height: 844, label: "iphone-14" },
  tablet: { width: 820, height: 1180, label: "ipad" },
  desktop: { width: 1440, height: 900, label: "desktop" },
};

const MARKETING_PUBLIC_ROUTES = [
  { id: "01-home", path: "/", name: "Home" },
  { id: "02-discover", path: "/discover", name: "Discover" },
  { id: "03-discover-events", path: "/discover?tab=events", name: "Discover Events" },
  { id: "04-discover-services", path: "/discover?tab=services", name: "Discover Services" },
  { id: "05-community-gaming", path: "/community/rocket-league-ssl", name: "Community Gaming" },
  { id: "06-community-code", path: "/community/code-craft-academy", name: "Community Code" },
  { id: "07-community-photo", path: "/community/lens-masters-guild", name: "Community Fotografie" },
  { id: "08-community-business", path: "/community/business-circle-dach", name: "Community Business" },
];

const MARKETING_AUTH_ROUTES = [
  { id: "11-dashboard", path: "/dashboard", name: "Dashboard" },
  { id: "12-members", path: "/dashboard/community/rocket-league-ssl/members", name: "Mitglieder" },
  { id: "13-requests", path: "/dashboard/community/rocket-league-ssl/requests", name: "Antraege" },
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
  { id: "24-crowd-partner", path: "/dashboard/crowd-partner", name: "Crowd Partner" },
];

const DOCUMENTATION_ROUTES = [
  { id: "10-login", path: "/auth/login", name: "Login" },
  { id: "09-crowd-partner-guest", path: "/dashboard/crowd-partner", name: "Crowd Partner Gast" },
];

const mode = process.argv.includes("--documentation") ? "documentation" : "marketing";

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

async function captureRoute(page, route, viewportKey, outDir, { marketingMode }) {
  const url = marketingMode ? marketingUrl(base, route.path) : `${base}${route.path}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(marketingMode ? 2500 : 1500);
    if (marketingMode) await assertNoOverlays(page, route.id);
    const file = join(outDir, `${route.id}-${route.name.replace(/\s+/g, "-").toLowerCase()}.png`);
    await page.screenshot({ path: file, fullPage: viewportKey === "mobile" });
    console.log(`  OK [${viewportKey}] ${route.name}`);
    return true;
  } catch (err) {
    console.error(`  FAIL [${viewportKey}] ${route.name}: ${err.message}`);
    return false;
  }
}

async function captureMarketing() {
  const outRoot = dirs.screenshotsMarketing;
  console.log(`\n=== Marketing-Screenshots ===\nBase: ${base}\nOut: ${outRoot}\n`);

  const browser = await launchBrowser();
  let failed = 0;

  for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
    const outDir = join(outRoot, viewport.label);
    await mkdir(outDir, { recursive: true });
    console.log(`\n--- ${viewport.label} (${viewport.width}x${viewport.height}) ---`);

    const ctx = await createMarketingContext(browser, {
      width: viewport.width,
      height: viewport.height,
      mobile: viewportKey === "mobile",
    });
    const page = await ctx.newPage();
    await prepareMarketingPage(page);

    for (const route of MARKETING_PUBLIC_ROUTES) {
      if (!(await captureRoute(page, route, viewportKey, outDir, { marketingMode: true }))) failed++;
    }

    const loggedIn = await tryLogin(page);
    if (loggedIn) {
      console.log("  OK Demo-Login");
      for (const route of MARKETING_AUTH_ROUTES) {
        if (!(await captureRoute(page, route, viewportKey, outDir, { marketingMode: true }))) failed++;
      }
    } else {
      console.warn("  WARN Login fehlgeschlagen - Dashboard-Screenshots uebersprungen");
      failed += MARKETING_AUTH_ROUTES.length;
    }

    await ctx.close();
  }

  await browser.close();
  return { failed, outRoot };
}

async function captureDocumentation() {
  const outRoot = dirs.screenshotsDocumentation;
  console.log(`\n=== Dokumentations-Screenshots ===\nBase: ${base}\nOut: ${outRoot}\n`);

  const browser = await launchBrowser();
  let failed = 0;

  for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
    const outDir = join(outRoot, viewport.label);
    await mkdir(outDir, { recursive: true });
    console.log(`\n--- ${viewport.label} ---`);

    const ctx = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: viewportKey === "mobile",
      hasTouch: viewportKey === "mobile",
      locale: "de-DE",
    });
    const page = await ctx.newPage();

    for (const route of DOCUMENTATION_ROUTES) {
      if (!(await captureRoute(page, route, viewportKey, outDir, { marketingMode: false }))) failed++;
    }

    await ctx.close();
  }

  await browser.close();
  return { failed, outRoot };
}

async function main() {
  const result = mode === "documentation" ? await captureDocumentation() : await captureMarketing();
  console.log(`\nFertig: ${result.outRoot}`);
  if (result.failed) {
    console.error(`\n${result.failed} Screenshot(s) fehlgeschlagen.\n`);
    process.exit(1);
  }
  console.log("\nPortfolio komplett.\n");
}

main();

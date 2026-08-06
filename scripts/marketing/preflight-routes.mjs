#!/usr/bin/env node
/**
 * Pre-Flight: Routen auf JS/API-Fehler, leere Seiten, Overlays pruefen.
 */
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { launchBrowser, createMarketingContext, hideLegacyMarketingUI } from "./browser.mjs";
import { marketingUrl, MARKETING_INIT_SCRIPT } from "./marketing-url.mjs";
import { CAPTURE_ROUTES, dirs, base, demoEmail, demoPassword } from "./config.mjs";

export const PREFLIGHT_ROUTES = [
  ...CAPTURE_ROUTES,
  { id: "service-coaching", path: "/community/rocket-league-ssl/group/einzelcoaching", auth: false },
  { id: "community-members-tab", path: "/community/rocket-league-ssl?tab=members", auth: false },
];

const ERROR_PATTERNS = [
  /Application error/i,
  /Something went wrong/i,
  /404/i,
  /Seite nicht gefunden/i,
  /Internal Server Error/i,
  /Ein Fehler ist aufgetreten/i,
  /Lorem ipsum/i,
  /placeholder/i,
  /\uFFFD/,
];

const OVERLAY_SELECTORS = [
  'text="Was ist UNZE?"',
  'text="UNZE als App installieren"',
  'text="Zum Home-Bildschirm"',
];

async function tryLogin(page) {
  await page.goto(marketingUrl(base, "/auth/login"), { waitUntil: "domcontentloaded", timeout: 60000 });
  const email = page.locator('input[type="email"]').first();
  if (!(await email.count())) return false;
  await email.fill(demoEmail);
  await page.locator('input[type="password"]').first().fill(demoPassword);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3500);
  return !page.url().includes("/auth/login");
}

async function checkRoute(page, route) {
  const issues = [];
  const consoleErrors = [];
  const apiErrors = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (text.includes("attribute d: Expected number")) return;
    consoleErrors.push(text);
  });
  page.on("response", (res) => {
    const url = res.url();
    if ((url.includes("/api/") || url.includes("supabase.co")) && res.status() >= 400) {
      apiErrors.push(`${res.status()} ${url}`);
    }
  });

  const url = marketingUrl(base, route.path);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2500);
    await hideLegacyMarketingUI(page);
  } catch (err) {
    issues.push(`Navigation: ${err.message}`);
    return { id: route.id, ok: false, issues, consoleErrors, apiErrors };
  }

  const bodyText = await page.locator("body").innerText().catch(() => "");
  for (const re of ERROR_PATTERNS) {
    if (re.test(bodyText)) issues.push(`Text-Muster: ${re}`);
  }

  if (bodyText.trim().length < 80) {
    issues.push("Seite wirkt leer (< 80 Zeichen)");
  }

  for (const sel of OVERLAY_SELECTORS) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false);
    if (visible) issues.push(`Overlay sichtbar: ${sel}`);
  }

  if (consoleErrors.length) {
    const critical = consoleErrors.filter(
      (t) =>
        !t.includes("Failed to load resource") &&
        !t.includes("favicon") &&
        !t.includes("attribute d: Expected number"),
    );
    if (critical.length) {
      issues.push(`Console: ${critical.slice(0, 3).join(" | ")}`);
    }
  }
  if (apiErrors.length) {
    issues.push(`API: ${apiErrors.slice(0, 3).join(" | ")}`);
  }

  return { id: route.id, ok: issues.length === 0, issues, consoleErrors, apiErrors };
}

export async function runPreflight() {
  const browser = await launchBrowser();
  const ctx = await createMarketingContext(browser, { width: 390, height: 844, mobile: true });
  await ctx.addInitScript(MARKETING_INIT_SCRIPT);
  const page = await ctx.newPage();

  const loggedIn = await tryLogin(page);
  const results = [];

  for (const route of PREFLIGHT_ROUTES) {
    if (route.auth && !loggedIn) {
      results.push({ id: route.id, ok: false, issues: ["Login fehlgeschlagen"], skipped: true });
      continue;
    }
    const r = await checkRoute(page, route);
    results.push(r);
    console.log(r.ok ? `  \u2713 ${route.id}` : `  \u2717 ${route.id}: ${r.issues.join("; ")}`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  const report = {
    checkedAt: new Date().toISOString(),
    base,
    marketingMode: true,
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: failed.length,
    results,
  };

  await mkdir(dirs.output, { recursive: true });
  await writeFile(join(dirs.output, "preflight-report.json"), JSON.stringify(report, null, 2), "utf8");

  return report;
}

async function main() {
  console.log("\n=== Marketing Pre-Flight ===\n");
  const report = await runPreflight();
  if (report.failed > 0) {
    console.error(`\n${report.failed} Route(n) fehlgeschlagen. Siehe docs/marketing/output/preflight-report.json`);
    process.exit(1);
  }
  console.log(`\n\u2713 Pre-Flight OK (${report.passed}/${report.total})`);
}

if (process.argv[1]?.includes("preflight-routes")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

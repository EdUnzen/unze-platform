#!/usr/bin/env node
/**
 * Marketing Showcase Captures — Business, Connect, Studio, Templates
 *
 * Usage:
 *   npm run marketing:capture:showcase
 *   npm run marketing:capture:business
 *   npm run marketing:capture:studio
 *   node scripts/marketing/capture-showcase.mjs --category=studio --id=studio-overview
 *
 * Env:
 *   MARKETING_LOCAL_BASE=http://localhost:3000
 *   STUDIO_EMAIL=support@unze.app
 *   STUDIO_PASSWORD=...
 *   DEMO_EMAIL / DEMO_PASSWORD (Connect-Login)
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
import { demoEmail, demoPassword } from "./config.mjs";
import {
  loadShowcaseCatalog,
  resolveBase,
  VIEWPORTS,
  showcaseDirs,
} from "./showcase-config.mjs";

function parseArgs(argv) {
  const opts = { category: null, id: null, priority: null, overload: false };
  for (const arg of argv) {
    if (arg.startsWith("--category=")) opts.category = arg.slice("--category=".length);
    else if (arg.startsWith("--id=")) opts.id = arg.slice("--id=".length);
    else if (arg.startsWith("--priority=")) opts.priority = arg.slice("--priority=".length);
    else if (arg === "--overload") opts.overload = true;
  }
  return opts;
}

function filterItems(catalog, opts) {
  let items = catalog.items.filter((item) => !item.skipCapture);

  if (opts.id) {
    items = items.filter((item) => item.id === opts.id);
  }
  if (opts.category) {
    items = items.filter((item) => item.category === opts.category);
  }
  if (opts.priority) {
    items = items.filter((item) => item.priority === opts.priority);
  }
  if (opts.overload) {
    items = items.filter((item) => item.base === "local");
  }

  return items;
}

function buildUrl(item) {
  const base = resolveBase(item);
  if (item.marketingMode) {
    return marketingUrl(base, item.route);
  }
  return new URL(item.route, base).toString();
}

async function tryConnectLogin(page, base) {
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

async function tryStudioLogin(page, base) {
  const email = process.env.STUDIO_EMAIL ?? "support@unze.app";
  const password = process.env.STUDIO_PASSWORD;

  if (!password) {
    console.warn("  ⚠ STUDIO_PASSWORD nicht gesetzt — Studio-Captures übersprungen");
    return false;
  }

  await page.goto(new URL("/admin?setup=0", base).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const emailInput = page.locator("#studio-email");
  const passwordInput = page.locator("#studio-password");
  if (!(await emailInput.count())) return false;

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator('button[type="submit"]').first().click();

  try {
    await page.waitForURL(/\/studio\/app/, { timeout: 20000 });
    return true;
  } catch {
    return page.url().includes("/studio/app");
  }
}

async function captureItem(page, item, viewportKey, outDir) {
  const vp = VIEWPORTS[viewportKey];
  const url = buildUrl(item);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);

  if (item.category === "connect" || item.auth === "connect") {
    await assertNoOverlays(page, item.id).catch(() => {});
  }

  const fileName = `${item.id}${vp.suffix}.png`;
  const filePath = join(outDir, item.category, fileName);
  await mkdir(join(outDir, item.category), { recursive: true });
  await page.screenshot({ path: filePath, fullPage: item.fullPage ?? false });

  console.log(`  ✓ ${item.id}${vp.suffix}`);
  return { id: item.id, viewport: viewportKey, path: filePath, category: item.category, url };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const catalog = loadShowcaseCatalog();
  const items = filterItems(catalog, opts);

  if (!items.length) {
    console.error("Keine Showcase-Items für Filter gefunden.");
    process.exit(1);
  }

  console.log(`Showcase Capture — ${items.length} Item(s)`);
  if (opts.category) console.log(`  Kategorie: ${opts.category}`);
  if (opts.id) console.log(`  ID: ${opts.id}`);

  await mkdir(showcaseDirs.root, { recursive: true });
  const browser = await launchBrowser();

  const needsConnect = items.some((i) => i.auth === "connect");
  const needsStudio = items.some((i) => i.auth === "studio");

  let connectLoggedIn = false;
  let studioLoggedIn = false;

  const manifest = {
    capturedAt: new Date().toISOString(),
    filter: opts,
    localBase: showcaseDirs.root,
    files: [],
  };

  for (const viewportKey of ["mobile", "desktop", "ipad"]) {
    const viewportItems = items.filter((i) => i.viewports.includes(viewportKey));
    if (!viewportItems.length) continue;

    const vp = VIEWPORTS[viewportKey];
    const ctx = await createMarketingContext(browser, vp);
    const page = await ctx.newPage();
    await prepareMarketingPage(page);

    if (needsConnect && !connectLoggedIn) {
      connectLoggedIn = await tryConnectLogin(page, resolveBase({ base: "local" }));
    }
    if (needsStudio && !studioLoggedIn) {
      studioLoggedIn = await tryStudioLogin(page, resolveBase({ base: "local" }));
    }

    for (const item of viewportItems) {
      if (item.auth === "connect" && !connectLoggedIn) {
        console.warn(`  ⚠ ${item.id} — Connect-Login fehlgeschlagen, übersprungen`);
        continue;
      }
      if (item.auth === "studio" && !studioLoggedIn) {
        console.warn(`  ⚠ ${item.id} — Studio-Login fehlgeschlagen, übersprungen`);
        continue;
      }

      try {
        const file = await captureItem(page, item, viewportKey, showcaseDirs.root);
        manifest.files.push(file);
      } catch (err) {
        console.error(`  ✗ ${item.id}-${viewportKey}: ${err.message}`);
      }
    }

    await ctx.close();
  }

  await writeFile(showcaseDirs.manifest, JSON.stringify(manifest, null, 2), "utf8");
  await browser.close();

  console.log(`\nCaptures: ${manifest.files.length} Dateien in docs/marketing/raw-screens/showcase/`);
  console.log(`Manifest: docs/marketing/raw-screens/showcase/manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

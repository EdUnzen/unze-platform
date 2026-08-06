#!/usr/bin/env node
/**
 * Extrahiert gerenderte Inhalte von www.unze.app (Manus SPA).
 */
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { launchBrowser } from "./marketing/browser.mjs";

const BASE = "https://www.unze.app";
const OUT = join(process.cwd(), "public", "landing-migration", "extracted");

const ROUTES = [
  { id: "home", path: "/" },
  { id: "impressum", path: "/impressum" },
  { id: "datenschutz", path: "/datenschutz" },
  { id: "kontakt", path: "/kontakt" },
];

async function extractPage(page, route) {
  await page.goto(BASE + route.path, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const root = document.getElementById("root");
    const text = (root ?? document.body).innerText;
    const links = [...document.querySelectorAll("a[href]")].map((a) => ({
      href: a.getAttribute("href"),
      text: a.textContent?.trim(),
    }));
    const images = [...document.querySelectorAll("img[src]")].map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
    }));
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => ({
      tag: h.tagName,
      text: h.textContent?.trim(),
    }));
    const sections = [...document.querySelectorAll("section")].map((s, i) => ({
      index: i,
      className: s.className,
      text: s.innerText?.slice(0, 500),
    }));
    return { text, links, images, headings, sections, title: document.title };
  });

  return data;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const report = { extractedAt: new Date().toISOString(), base: BASE, pages: {} };

  for (const route of ROUTES) {
    console.log(`Extracting ${route.path}...`);
    try {
      const data = await extractPage(page, route);
      report.pages[route.id] = data;
      await writeFile(join(OUT, `${route.id}.json`), JSON.stringify(data, null, 2), "utf8");
      await page.screenshot({ path: join(OUT, `${route.id}.png`), fullPage: true });
      console.log(`  OK: ${data.headings.length} headings, ${data.images.length} images`);
    } catch (err) {
      console.error(`  FAIL: ${err.message}`);
      report.pages[route.id] = { error: err.message };
    }
  }

  await writeFile(join(OUT, "report.json"), JSON.stringify(report, null, 2), "utf8");
  await browser.close();
  console.log(`\nDone: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Rendert Marketing-Mockups aus echten App-Screenshots + Compositor-Templates.
 */
import { readFile, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { launchBrowser } from "./browser.mjs";
import {
  CREATOR_STORY,
  SOCIAL_EXPORTS,
  dirs,
} from "./config.mjs";

async function loadTemplate(name) {
  return readFile(join(dirs.engine, name), "utf8");
}

async function loadScreenB64(screenId) {
  const path = join(dirs.raw, `${screenId}.png`);
  if (!existsSync(path)) {
    throw new Error(`Screenshot fehlt: ${path} (zuerst npm run marketing:capture)`);
  }
  const buf = await readFile(path);
  return buf.toString("base64");
}

function fillTemplate(html, vars) {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

async function renderHtml(page, html, { width, height, outPath }) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPath, type: "png" });
}

export async function renderStorySlides(browser) {
  const template = await loadTemplate("compositor-story.html");
  const carouselTemplate = await loadTemplate("compositor-carousel.html");
  const page = await browser.newPage();
  const results = [];

  await mkdir(join(dirs.output, "story"), { recursive: true });
  await mkdir(join(dirs.output, "carousel"), { recursive: true });
  await mkdir(join(dirs.output, "reels"), { recursive: true });

  for (let i = 0; i < CREATOR_STORY.length; i++) {
    const slide = CREATOR_STORY[i];
    const b64 = await loadScreenB64(slide.screen);
    const step = `${String(i + 1).padStart(2, "0")} / ${String(CREATOR_STORY.length).padStart(2, "0")}`;
    const vars = {
      STEP: step,
      HEADLINE: slide.headline,
      SUBLINE: slide.subline,
      SCREEN_B64: b64,
    };

    const storyPath = join(dirs.output, "story", `${slide.id}.png`);
    await renderHtml(page, fillTemplate(template, vars), {
      width: 1080,
      height: 1920,
      outPath: storyPath,
    });
    results.push(storyPath);

    const carouselPath = join(dirs.output, "carousel", `${slide.id}.png`);
    await renderHtml(page, fillTemplate(carouselTemplate, vars), {
      width: 1080,
      height: 1080,
      outPath: carouselPath,
    });
    results.push(carouselPath);

    const reelsPath = join(dirs.output, "reels", `${slide.id}.png`);
    await renderHtml(page, fillTemplate(template, vars), {
      width: 1080,
      height: 1920,
      outPath: reelsPath,
    });
    results.push(reelsPath);

    console.log(`  \u2713 ${slide.id}`);
  }

  await page.close();
  return results;
}

export async function renderSocialExports(browser) {
  const heroTemplate = await loadTemplate("compositor-hero.html");
  const wideTemplate = await loadTemplate("compositor-wide.html");
  const page = await browser.newPage();
  const results = [];

  await mkdir(dirs.output, { recursive: true });

  for (const item of SOCIAL_EXPORTS) {
    const screenId =
      item.screen ??
      (item.screens ? item.screens.find((s) => existsSync(join(dirs.raw, `${s}-desktop.png`))) ?? item.screens[0] : null);
    const desktopId = `${screenId}-desktop`;
    const mobileId = screenId;
    const useDesktop = existsSync(join(dirs.raw, `${desktopId}.png`));
    const b64 = await loadScreenB64(useDesktop ? desktopId : mobileId);

    let html;
    let width;
    let height;

    if (item.layout === "hero") {
      html = fillTemplate(heroTemplate, {
        HEADLINE: "Deine Community. Ein Ort.",
        SUBLINE: "Creator Beta \u2014 Communities, Events, Auszeichnungen und Crowd Partner auf einer Plattform.",
        SCREEN_B64: b64,
      });
      width = item.width;
      height = item.height;
    } else {
      html = fillTemplate(wideTemplate, {
        WIDTH: String(item.width),
        HEIGHT: String(item.height),
        SCREEN_B64: b64,
      });
      width = item.width;
      height = item.height;
    }

    const outPath = join(dirs.output, `${item.id}.png`);
    await renderHtml(page, html, { width, height, outPath });
    results.push(outPath);
    console.log(`  \u2713 ${item.id}`);
  }

  await page.close();
  return results;
}

async function main() {
  const browser = await launchBrowser();
  console.log("Story + Carousel + Reels (9:16)...");
  await renderStorySlides(browser);
  console.log("Social + Hero + Presse...");
  await renderSocialExports(browser);
  await browser.close();
  console.log("\nFertig: docs/marketing/output/");
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("render-composite.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

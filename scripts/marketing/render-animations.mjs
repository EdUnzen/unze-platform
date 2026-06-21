#!/usr/bin/env node
/**
 * Rendert Marketing-Animationen als WebM oder animiertes WebP (Fallback ohne ffmpeg).
 */
import { readFile, mkdir, rename, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import sharp from "sharp";
import { launchBrowser } from "./browser.mjs";
import { ANIMATIONS, dirs } from "./config.mjs";

async function loadScreenB64(id) {
  const p = join(dirs.raw, `${id}.png`);
  if (!existsSync(p)) return "";
  return (await readFile(p)).toString("base64");
}

async function injectScreenshots(html) {
  const screens = {
    DISCOVER: await loadScreenB64("discover"),
    DASHBOARD: await loadScreenB64("dashboard"),
    MEMBERS: await loadScreenB64("members"),
    CROWD: await loadScreenB64("crowd-partner"),
    MONETIZATION: await loadScreenB64("monetization"),
    AUSZEICHNUNGEN: await loadScreenB64("auszeichnungen"),
    EVENTS: await loadScreenB64("events-dash"),
    PROFILE: await loadScreenB64("profile-id"),
  };
  let out = html;
  for (const [key, b64] of Object.entries(screens)) {
    out = out.split(`{{SCREEN_${key}}}`).join(b64);
  }
  return out;
}

async function renderWithVideo(browser, tmpHtml, anim, outDir, tmpDir) {
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 2,
    recordVideo: { dir: tmpDir, size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });
  await page.waitForTimeout(anim.durationMs);
  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const src = await video.path();
    await rename(src, join(outDir, `${anim.id}.webm`));
  }
}

async function renderWithFrames(page, tmpHtml, anim, outDir) {
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });

  const fps = 8;
  const frames = Math.min(Math.ceil((anim.durationMs / 1000) * fps), 48);
  const buffers = [];

  for (let i = 0; i < frames; i++) {
    await page.waitForTimeout(1000 / fps);
    const shot = await page.screenshot({ type: "png" });
    buffers.push(await sharp(shot).resize(405, 720, { fit: "cover" }).png().toBuffer());
  }

  const delayCs = Math.round((1000 / fps) / 10);
  await sharp(buffers, { animated: true })
    .gif({ delay: delayCs, loop: 0 })
    .toFile(join(outDir, `${anim.id}.gif`));
}

export async function renderAnimations(browser) {
  const outDir = join(dirs.output, "animations");
  const tmpDir = join(outDir, "_tmp");
  await mkdir(tmpDir, { recursive: true });
  const framePage = await browser.newPage();

  for (const anim of ANIMATIONS) {
    const srcPath = join(dirs.animations, anim.file);
    if (!existsSync(srcPath)) {
      console.warn(`  \u26a0 Animation fehlt: ${anim.file}`);
      continue;
    }

    const html = await injectScreenshots(await readFile(srcPath, "utf8"));
    const tmpHtml = join(tmpDir, `${anim.id}.html`);
    await writeFile(tmpHtml, html, "utf8");

    try {
      await renderWithVideo(browser, tmpHtml, anim, outDir, tmpDir);
      console.log(`  \u2713 ${anim.id}.webm`);
    } catch {
      await renderWithFrames(framePage, tmpHtml, anim, outDir);
      console.log(`  \u2713 ${anim.id}.gif`);
    }
  }

  await framePage.close().catch(() => {});
}

async function main() {
  await mkdir(join(dirs.output, "animations"), { recursive: true });
  const browser = await launchBrowser();
  console.log("Marketing-Animationen...");
  try {
    await renderAnimations(browser);
  } finally {
    await browser.close().catch(() => {});
  }
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("render-animations.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

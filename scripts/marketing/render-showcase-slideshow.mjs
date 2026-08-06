#!/usr/bin/env node
/**
 * Slideshow-Werbevideos aus Showcase-Screenshots (WebM + optional MP4).
 *
 * Usage:
 *   npm run marketing:video:slideshow
 *   npm run marketing:video:business
 *   node scripts/marketing/render-showcase-slideshow.mjs --id=business-reel
 *
 * Voraussetzung: Screenshots unter docs/marketing/raw-screens/showcase/
 * (npm run marketing:capture:overload)
 */
import { readFile, mkdir, writeFile, rename } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { spawnSync } from "child_process";
import { launchBrowser } from "./browser.mjs";
import { dirs } from "./config.mjs";
import { loadShowcaseCatalog, showcaseDirs } from "./showcase-config.mjs";

const SLIDESHOW_CONFIG = join(process.cwd(), "docs", "marketing", "showcase-slideshows.json");
const ENGINE_TEMPLATE = join(process.cwd(), "docs", "marketing", "engine", "compositor-slideshow.html");
const VIDEO_OUT = join(process.cwd(), "docs", "marketing", "output", "videos");

const LEGACY_CONNECT_MAP = {
  "connect-home": "home",
  "connect-discover": "discover",
  "connect-community-gaming": "community-gaming",
  "connect-dashboard": "dashboard",
  "connect-create-community": "create-community",
};

function parseArgs(argv) {
  const opts = { id: null, category: null };
  for (const arg of argv) {
    if (arg.startsWith("--id=")) opts.id = arg.slice("--id=".length);
    if (arg.startsWith("--category=")) opts.category = arg.slice("--category=".length);
  }
  return opts;
}

function viewportSuffix(viewport) {
  if (viewport === "desktop") return "-desktop";
  if (viewport === "ipad") return "-ipad";
  return "";
}

function resolveImagePath(catalog, showcaseId, viewport) {
  const item = catalog.items.find((i) => i.id === showcaseId);
  const suffix = viewportSuffix(viewport);

  if (item) {
    const candidates = [
      join(showcaseDirs.root, item.category, `${showcaseId}${suffix}.png`),
      join(showcaseDirs.root, item.category, `${showcaseId}.png`),
      join(showcaseDirs.root, item.category, `${showcaseId}-desktop.png`),
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
  }

  const legacyId = LEGACY_CONNECT_MAP[showcaseId] ?? showcaseId;
  const legacyCandidates = [
    join(dirs.raw, `${legacyId}${suffix}.png`),
    join(dirs.raw, `${legacyId}.png`),
    join(dirs.raw, `${legacyId}-desktop.png`),
  ];
  for (const p of legacyCandidates) {
    if (existsSync(p)) return p;
  }

  return null;
}

function fillTemplate(html, vars) {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(String(value ?? ""));
  }
  return out;
}

function buildSlideKeyframes(slideCount, slideMs, transitionMs) {
  const totalMs = slideCount * slideMs;
  let css = "";
  for (let i = 0; i < slideCount; i++) {
    const startPct = ((i * slideMs) / totalMs) * 100;
    const fadeInEnd = (((i * slideMs) + transitionMs) / totalMs) * 100;
    const holdEnd = (((i + 1) * slideMs - transitionMs) / totalMs) * 100;
    const endPct = (((i + 1) * slideMs) / totalMs) * 100;
    css += `
    @keyframes slideCycle-${i} {
      0%, ${startPct.toFixed(2)}% { opacity: 0; }
      ${fadeInEnd.toFixed(2)}%, ${holdEnd.toFixed(2)}% { opacity: 1; }
      ${endPct.toFixed(2)}%, 100% { opacity: 0; }
    }
    .slide-${i} { animation-name: slideCycle-${i}; }
    .slide-${i} .slide-inner img { animation-delay: ${i * slideMs}ms; }
    .slide-${i} .headline-wrap { animation: textIn-${i} ${slideMs}ms ease forwards; }
    @keyframes textIn-${i} {
      0%, ${startPct.toFixed(2)}% { opacity: 0; transform: translateX(-50%) translateY(10px); }
      ${fadeInEnd.toFixed(2)}%, ${holdEnd.toFixed(2)}% { opacity: 1; transform: translateX(-50%) translateY(0); }
      ${endPct.toFixed(2)}%, 100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    }`;
  }
  return css;
}

function buildSlidesHtml(slides, slideMs, totalMs) {
  return slides
    .map(
      (slide, i) => `
  <div class="slide slide-${i}" style="animation: slideCycle-${i} ${totalMs}ms linear forwards;">
    <div class="headline-wrap">
      <div class="headline">${slide.headline}</div>
      <div class="subline">${slide.subline}</div>
    </div>
    <div class="slide-inner">
      <img src="data:image/png;base64,${slide.imageB64}" alt="" />
    </div>
  </div>`,
    )
    .join("\n");
}

function layoutVars(format, defaults) {
  const isVertical = format === "vertical";
  const size = isVertical ? defaults.vertical : defaults.horizontal;
  return {
    WIDTH: size.width,
    HEIGHT: size.height,
    FRAME_INSET: isVertical ? 120 : 80,
    FRAME_RADIUS: isVertical ? 32 : 24,
    HEADLINE_TOP: isVertical ? 100 : 48,
    HEADLINE_SIZE: isVertical ? 34 : 42,
    SUBLINE_SIZE: isVertical ? 22 : 26,
    CTA_BOTTOM: isVertical ? 72 : 48,
    CTA_SIZE: isVertical ? 22 : 24,
    BRAND_TOP: isVertical ? 44 : 28,
    BRAND_SIZE: isVertical ? 14 : 16,
  };
}

async function buildSlideshowHtml(slideshow, catalog, defaults) {
  const slideMs = defaults.slideDurationMs;
  const slides = [];

  for (const spec of slideshow.slides) {
    const imagePath = resolveImagePath(catalog, spec.showcaseId, spec.viewport ?? "mobile");
    if (!imagePath) {
      console.warn(`  ⚠ Bild fehlt: ${spec.showcaseId} (${spec.viewport ?? "mobile"})`);
      continue;
    }
    const imageB64 = (await readFile(imagePath)).toString("base64");
    slides.push({
      headline: spec.headline,
      subline: spec.subline,
      imageB64,
      imagePath,
    });
  }

  if (!slides.length) {
    throw new Error(`Keine Bilder für "${slideshow.id}". Zuerst: npm run marketing:capture:overload`);
  }

  const template = await readFile(ENGINE_TEMPLATE, "utf8");
  const layout = layoutVars(slideshow.format, defaults);
  const totalMs = slides.length * slideMs;

  const html = fillTemplate(template, {
    ...layout,
    SLIDE_MS: slideMs,
    TOTAL_MS: totalMs,
    CTA_DELAY: Math.max(0, totalMs - 1200),
    CTA: slideshow.cta ?? "UNZE",
    SLIDE_KEYFRAMES: buildSlideKeyframes(slides.length, slideMs, defaults.transitionMs),
    SLIDES_HTML: buildSlidesHtml(slides, slideMs, totalMs),
  });

  return { html, slides, totalMs, layout };
}

async function renderVideo(browser, html, slideshow, totalMs, layout) {
  const tmpDir = join(VIDEO_OUT, "_tmp");
  await mkdir(tmpDir, { recursive: true });
  const tmpHtml = join(tmpDir, `${slideshow.id}.html`);
  await writeFile(tmpHtml, html, "utf8");

  const context = await browser.newContext({
    viewport: { width: layout.WIDTH, height: layout.HEIGHT },
    deviceScaleFactor: 2,
    recordVideo: { dir: tmpDir, size: { width: layout.WIDTH, height: layout.HEIGHT } },
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });
  await page.waitForTimeout(totalMs + 800);

  const video = page.video();
  await page.close();
  await context.close();

  if (!video) throw new Error("Video-Aufnahme fehlgeschlagen");

  const webmSrc = await video.path();
  const webmOut = join(VIDEO_OUT, `${slideshow.id}.webm`);
  await rename(webmSrc, webmOut);
  return webmOut;
}

function tryConvertMp4(webmPath) {
  const mp4Path = webmPath.replace(/\.webm$/, ".mp4");
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-i", webmPath, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4Path],
    { stdio: "pipe", shell: process.platform === "win32" },
  );
  if (r.status === 0 && existsSync(mp4Path)) {
    return mp4Path;
  }
  return null;
}

async function renderSlideshow(browser, slideshow, catalog, defaults) {
  console.log(`\n▶ ${slideshow.title} (${slideshow.id})`);
  const { html, slides, totalMs, layout } = await buildSlideshowHtml(slideshow, catalog, defaults);
  console.log(`  ${slides.length} Slides · ${(totalMs / 1000).toFixed(1)}s · ${slideshow.format}`);

  const webmPath = await renderVideo(browser, html, slideshow, totalMs, layout);
  console.log(`  ✓ ${webmPath}`);

  const mp4Path = tryConvertMp4(webmPath);
  if (mp4Path) {
    console.log(`  ✓ ${mp4Path}`);
  } else {
    console.log("  ℹ MP4: ffmpeg nicht verfügbar — WebM nutzen (CapCut/Canva importieren OK)");
  }

  return {
    id: slideshow.id,
    title: slideshow.title,
    webm: webmPath,
    mp4: mp4Path,
    slides: slides.map((s) => s.imagePath),
    durationMs: totalMs,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const config = JSON.parse(await readFile(SLIDESHOW_CONFIG, "utf8"));
  const catalog = loadShowcaseCatalog();

  let slideshows = config.slideshows;
  if (opts.id) slideshows = slideshows.filter((s) => s.id === opts.id);
  if (opts.category) slideshows = slideshows.filter((s) => s.category === opts.category);

  if (!slideshows.length) {
    console.error("Keine Slideshows gefunden. --id= oder --category= prüfen.");
    process.exit(1);
  }

  await mkdir(VIDEO_OUT, { recursive: true });
  const browser = await launchBrowser();
  const manifest = { renderedAt: new Date().toISOString(), videos: [] };

  try {
    for (const slideshow of slideshows) {
      try {
        const result = await renderSlideshow(browser, slideshow, catalog, config.defaults);
        manifest.videos.push(result);
      } catch (err) {
        console.error(`  ✗ ${slideshow.id}: ${err.message}`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  await writeFile(join(VIDEO_OUT, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nFertig: ${manifest.videos.length} Video(s) in docs/marketing/output/videos/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

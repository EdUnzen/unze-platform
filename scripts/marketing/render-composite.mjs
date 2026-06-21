#!/usr/bin/env node
/**
 * Premium Marketing v3 - immersive Produkt-Compositing.
 */
import { readFile, mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { launchBrowser } from "./browser.mjs";
import {
  TIKTOK_STORY,
  FEATURE_ADS,
  CREATOR_CAMPAIGN,
  SOCIAL_EXPORTS,
  dirs,
} from "./config.mjs";

const ACCENTS = {
  emerald: { soft: "rgba(16, 185, 129, 0.28)", rgb: "16, 185, 129" },
  rose: { soft: "rgba(244, 63, 94, 0.3)", rgb: "244, 63, 94" },
  violet: { soft: "rgba(139, 92, 246, 0.28)", rgb: "139, 92, 246" },
  blue: { soft: "rgba(59, 130, 246, 0.28)", rgb: "59, 130, 246" },
  amber: { soft: "rgba(245, 158, 11, 0.28)", rgb: "245, 158, 11" },
  cyan: { soft: "rgba(6, 182, 212, 0.28)", rgb: "6, 182, 212" },
};

async function loadTemplate(name) {
  return readFile(join(dirs.engine, name), "utf8");
}

async function loadScreenB64(screenId) {
  const path = join(dirs.raw, `${screenId}.png`);
  if (!existsSync(path)) throw new Error(`Screenshot fehlt: ${path}`);
  return (await readFile(path)).toString("base64");
}

function fill(html, vars) {
  let out = html;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v ?? "");
  }
  return out;
}

function accentVars(accent) {
  const a = ACCENTS[accent] ?? ACCENTS.emerald;
  return { ACCENT_SOFT: a.soft, ACCENT_RGB: a.rgb };
}

function chipsHtml(labels) {
  if (!labels?.length) return "";
  return labels.map((l) => `<span class="chip">${l}</span>`).join("");
}

async function renderImmersive(page, slide, outPath) {
  const accent = accentVars(slide.accent ?? "emerald");
  const b64 = await loadScreenB64(slide.screen);
  const isCta = slide.layout === "immersive-cta";
  const hasChips = slide.layout === "immersive-chips";

  const html = fill(await loadTemplate("compositor-product-immersive.html"), {
    ...accent,
    SCREEN_B64: b64,
    MESSAGE: isCta || hasChips ? "" : (slide.message ?? ""),
    MSG_DISPLAY: isCta || hasChips || !slide.message ? "none" : "block",
    CTA_TEXT: isCta ? (slide.cta ?? slide.message ?? "") : "",
    CTA_DISPLAY: isCta ? "block" : "none",
    CHIPS_HTML: hasChips ? chipsHtml(slide.chips) : "",
  });

  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(450);
  await page.screenshot({ path: outPath, type: "png" });
}

async function renderSquare(page, slide, outPath) {
  const accent = accentVars(slide.accent ?? "emerald");
  const b64 = await loadScreenB64(slide.screen);
  const html = fill(await loadTemplate("compositor-product-square.html"), {
    ...accent,
    MESSAGE: slide.message ?? "",
    SCREEN_B64: b64,
  });
  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: outPath, type: "png" });
}

export async function renderTikTokStory(browser) {
  const page = await browser.newPage();
  const dirsOut = ["tiktok", "reels", "youtube-shorts", "instagram/stories"];
  for (const d of dirsOut) await mkdir(join(dirs.output, d), { recursive: true });

  for (const slide of TIKTOK_STORY) {
    if (!slide.screen) throw new Error(`${slide.id} braucht einen App-Screenshot`);
    for (const d of dirsOut) {
      await renderImmersive(page, slide, join(dirs.output, d, `${slide.id}.png`));
    }
    console.log(`  \u2713 ${slide.id}`);
  }
  await page.close();
}

export async function renderFeatureAds(browser) {
  const page = await browser.newPage();
  await mkdir(join(dirs.output, "features"), { recursive: true });
  await mkdir(join(dirs.output, "carousel"), { recursive: true });
  await mkdir(join(dirs.output, "instagram", "feed"), { recursive: true });

  for (const feat of FEATURE_ADS) {
    await renderImmersive(page, { ...feat, layout: "immersive" }, join(dirs.output, "features", `${feat.id}.png`));
    await renderSquare(page, feat, join(dirs.output, "carousel", `${feat.id}.png`));
    await copyFile(
      join(dirs.output, "carousel", `${feat.id}.png`),
      join(dirs.output, "instagram", "feed", `${feat.id}.png`),
    );
    console.log(`  \u2713 ${feat.id}`);
  }
  await page.close();
}

export async function renderCreatorCampaign(browser) {
  const page = await browser.newPage();
  await mkdir(join(dirs.output, "creator-beta"), { recursive: true });

  for (const slide of CREATOR_CAMPAIGN) {
    await renderImmersive(page, slide, join(dirs.output, "creator-beta", `${slide.id}.png`));
    console.log(`  \u2713 ${slide.id}`);
  }
  await page.close();
}

export async function renderSocialExports(browser) {
  const page = await browser.newPage();
  await mkdir(dirs.output, { recursive: true });

  for (const item of SOCIAL_EXPORTS) {
    const desktopPath = join(dirs.raw, `${item.screen}-desktop.png`);
    const mobilePath = join(dirs.raw, `${item.screen}.png`);
    const useDesktop = existsSync(desktopPath) && !item.layout?.includes("product");
    const b64 = (await readFile(useDesktop ? desktopPath : mobilePath)).toString("base64");

    let html;
    let w = item.width;
    let h = item.height;

    if (item.layout === "hero" || item.layout === "hero-compact") {
      html = fill(await loadTemplate("compositor-hero-v2.html"), {
        HEADLINE: "Deine Community. Ein Ort.",
        SUBLINE: "Werde einer der ersten Creator auf UNZE.",
        SCREEN_B64: b64,
      });
    } else if (item.layout === "product") {
      html = fill(await loadTemplate("compositor-product-immersive.html"), {
        ...accentVars("emerald"),
        SCREEN_B64: b64,
        MESSAGE: item.message ?? "UNZE Creator Beta",
        MSG_DISPLAY: "block",
        CTA_TEXT: "",
        CTA_DISPLAY: "none",
        CHIPS_HTML: "",
      });
    } else if (item.layout === "square-product") {
      html = fill(await loadTemplate("compositor-product-square.html"), {
        ...accentVars("violet"),
        MESSAGE: "",
        SCREEN_B64: b64,
      });
    } else {
      html = fill(await loadTemplate("compositor-wide-product.html"), {
        WIDTH: String(w),
        HEIGHT: String(h),
        SCREEN_B64: b64,
      });
    }

    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(dirs.output, `${item.id}.png`), type: "png" });
    console.log(`  \u2713 ${item.id}`);
  }
  await page.close();
}

async function main() {
  const browser = await launchBrowser();
  console.log("TikTok Story + Reels + Stories...");
  await renderTikTokStory(browser);
  console.log("Feature Ads...");
  await renderFeatureAds(browser);
  console.log("Creator Beta...");
  await renderCreatorCampaign(browser);
  console.log("Social Pack...");
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

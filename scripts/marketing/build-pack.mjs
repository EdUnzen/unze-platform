#!/usr/bin/env node
/**
 * Marketing Beta-Launch Pipeline:
 * Enrich -> Pre-Flight -> Capture -> Composites -> Animationen -> Validate -> Report
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { launchBrowser } from "./browser.mjs";
import {
  renderTikTokStory,
  renderFeatureAds,
  renderCreatorCampaign,
  renderSocialExports,
} from "./render-composite.mjs";
import { renderAnimations } from "./render-animations.mjs";
import { dirs } from "./config.mjs";

const root = process.cwd();
const args = new Set(process.argv.slice(2));

function run(label, cmd, cmdArgs, { optional = false } = {}) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (r.status !== 0) {
    if (optional) {
      console.warn(`${label} uebersprungen (exit ${r.status})`);
      return false;
    }
    throw new Error(`${label} fehlgeschlagen (exit ${r.status})`);
  }
  return true;
}

async function main() {
  if (!args.has("--skip-enrich") && existsSync(join(root, ".env.local"))) {
    run("Demo-Anreicherung", "node", ["scripts/marketing/enrich-demo-content.mjs"]);
  }

  if (!args.has("--skip-preflight")) {
    run("Pre-Flight Qualitaet", "node", ["scripts/marketing/preflight-routes.mjs"]);
  }

  if (!args.has("--skip-capture")) {
    run("Screenshots (Marketing-Modus)", "node", ["scripts/marketing/capture-screens.mjs"]);
  }

  run("Pre-Check Config", "node", ["scripts/marketing/validate-marketing.mjs", "--config-only"]);

  if (!existsSync(join(dirs.raw, "home.png"))) {
    throw new Error("Keine Raw-Screens. npm run marketing:build ohne --skip-capture ausfuehren.");
  }

  console.log("\n=== Premium Compositing ===");
  const browser = await launchBrowser();
  try {
    await renderTikTokStory(browser);
    await renderFeatureAds(browser);
    await renderCreatorCampaign(browser);
    await renderSocialExports(browser);
  } finally {
    await browser.close().catch(() => {});
  }

  if (!args.has("--skip-animations")) {
    console.log("\n=== Animationen ===");
    try {
      const animBrowser = await launchBrowser();
      try {
        await renderAnimations(animBrowser);
      } finally {
        await new Promise((r) => setTimeout(r, 500));
        await animBrowser.close().catch(() => {});
      }
    } catch (err) {
      const name = err?.name ?? "";
      if (name !== "TargetClosedError") {
        console.warn("Animationen Warnung:", err.message ?? err);
      }
    }
  }

  if (!args.has("--skip-validate")) {
    run("Docs", "node", ["scripts/marketing/write-docs.mjs"]);
    run("Validierung", "node", ["scripts/marketing/validate-marketing.mjs"]);
  }

  run("Abschlussbericht", "node", ["scripts/marketing/beta-launch-report.mjs"], { optional: true });

  console.log("\n\u2713 Beta-Launch Marketing Pipeline abgeschlossen: docs/marketing/output/");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

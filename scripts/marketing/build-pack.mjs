#!/usr/bin/env node
/**
 * Marketing v2 Pipeline: Demo-Stats -> Capture -> Composites -> Animationen -> Validate
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

function run(label, cmd, cmdArgs) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error(`${label} fehlgeschlagen (exit ${r.status})`);
}

async function main() {
  if (!args.has("--skip-seed") && existsSync(join(root, ".env.local"))) {
    run("Demo-Stats", "node", ["scripts/marketing/patch-demo-stats.mjs"]);
  }

  if (!args.has("--skip-capture")) {
    run("Screenshots", "node", ["scripts/marketing/capture-screens.mjs"]);
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
    const animBrowser = await launchBrowser();
    try {
      await renderAnimations(animBrowser);
    } finally {
      await animBrowser.close().catch(() => {});
    }
  }

  if (!args.has("--skip-validate")) {
    run("Docs", "node", ["scripts/marketing/write-docs.mjs"]);
    run("Validierung", "node", ["scripts/marketing/validate-marketing.mjs"]);
  }

  console.log("\n\u2713 Marketing v3 Build abgeschlossen: docs/marketing/output/");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

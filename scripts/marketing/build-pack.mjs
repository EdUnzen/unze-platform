#!/usr/bin/env node
/**
 * Orchestriert Marketing-Pipeline: Demo-Stats \u2192 Capture \u2192 Composite \u2192 Validate
 * Usage: npm run marketing:build
 * Flags: --skip-capture --skip-seed --skip-validate
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { launchBrowser } from "./browser.mjs";
import { renderStorySlides, renderSocialExports } from "./render-composite.mjs";
import { dirs } from "./config.mjs";

const root = process.cwd();
const args = new Set(process.argv.slice(2));

function run(label, cmd, cmdArgs) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (r.status !== 0) {
    throw new Error(`${label} fehlgeschlagen (exit ${r.status})`);
  }
}

async function main() {
  if (!args.has("--skip-seed") && existsSync(join(root, ".env.local"))) {
    run("Demo-Stats", "node", ["scripts/marketing/patch-demo-stats.mjs"]);
  } else if (!args.has("--skip-seed")) {
    console.log("\n=== Demo-Stats \u00fcbersprungen (.env.local fehlt) ===");
  }

  if (!args.has("--skip-capture")) {
    run("Screenshots", "node", ["scripts/marketing/capture-screens.mjs"]);
  } else {
    console.log("\n=== Screenshots \u00fcbersprungen (--skip-capture) ===");
  }

  const hasRaw = existsSync(join(dirs.raw, "home.png"));
  if (!hasRaw) {
    throw new Error("Keine Raw-Screens vorhanden. Ohne --skip-capture erneut ausf\u00fchren.");
  }

  console.log("\n=== Compositing ===");
  const browser = await launchBrowser();
  await renderStorySlides(browser);
  await renderSocialExports(browser);
  await browser.close();

  if (!args.has("--skip-validate")) {
    run("Docs (UTF-8)", "node", ["scripts/marketing/write-docs.mjs"]);
    run("Validierung", "node", ["scripts/marketing/validate-marketing.mjs"]);
  }

  console.log("\n\u2713 Marketing-Build abgeschlossen: docs/marketing/output/");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

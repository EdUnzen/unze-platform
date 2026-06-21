#!/usr/bin/env node
/**
 * Qualitaets-Gate fuer Marketing v2.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import sharp from "sharp";
import { allRequiredOutputs, allRequiredScreens, dirs, root, TIKTOK_STORY, FEATURE_ADS, CREATOR_CAMPAIGN } from "./config.mjs";

const MARKETING_ROOT = join(root, "docs", "marketing");
const TEXT_EXTS = new Set([".md", ".html", ".json", ".mjs"]);
const SKIP_DIRS = new Set(["templates", "graphics", "screenshots", "_tmp"]);

const MOJIBAKE = [/\uFFFD/, /f\uFFFDr/, /\uFFFDffnen/, /Men\uFFFD/, /Schlie\uFFFDen/];

const DOC_STYLE = [
  /\{\{STEP\}\}/,
  /\d{2}\s*\/\s*\d{2}/,
  /Schritt \d/i,
  /Usage:/i,
  /npm run/i,
];

const PLACEHOLDER = [
  /Lorem ipsum/i,
  /placeholder/i,
  /\[TBD\]/i,
  /#00ff00/i,
  /green screen/i,
];

/** @type {string[]} */
const failures = [];
/** @type {string[]} */
const passed = [];

function walkText(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkText(p);
    else if (TEXT_EXTS.has(extname(name))) {
      const text = readFileSync(p, "utf8");
      for (const re of MOJIBAKE) {
        if (re.test(text)) {
          failures.push(`Encoding: ${p}`);
          break;
        }
      }
      if (/[\\/]engine[\\/]/.test(p)) {
        for (const re of [...DOC_STYLE, ...PLACEHOLDER]) {
          if (re.test(text)) failures.push(`Dokumentationsstil/Platzhalter: ${p}`);
        }
      }
    }
  }
}

async function checkPngQuality(filePath) {
  const st = statSync(filePath);
  if (st.size < 100000) {
    const isWide = filePath.includes("linkedin") || filePath.includes("facebook") || filePath.includes("website-header");
    if (!isWide || st.size < 70000) {
      failures.push(`Zu klein fuer Premium-Marketing: ${filePath} (${st.size} bytes)`);
    }
  }

  const meta = await sharp(filePath).metadata();
  const cw = Math.floor((meta.width ?? 1080) * 0.55);
  const ch = Math.floor((meta.height ?? 1920) * 0.5);
  const left = Math.floor(((meta.width ?? 1080) - cw) / 2);
  const top = Math.floor((meta.height ?? 1920) * 0.25);

  const { data, info } = await sharp(filePath)
    .extract({ left, top, width: cw, height: ch })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lum = [];
  for (let i = 0; i < data.length; i += info.channels) {
    lum.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  const avg = lum.reduce((a, b) => a + b, 0) / lum.length;
  const variance = lum.reduce((a, b) => a + (b - avg) ** 2, 0) / lum.length;
  if (variance < 120) {
    failures.push(`Kein App-Inhalt im Zentrum (Textfolie?): ${filePath}`);
  }

  const { data: thumb, info: ti } = await sharp(filePath)
    .resize(120, 120, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let greenish = 0;
  const pixels = ti.width * ti.height;
  for (let i = 0; i < thumb.length; i += ti.channels) {
    const r = thumb[i];
    const g = thumb[i + 1];
    const b = thumb[i + 2];
    if (g > 140 && g > r * 1.4 && g > b * 1.4) greenish++;
  }
  if (greenish / pixels > 0.55) {
    failures.push(`Gruener Platzhalter: ${filePath}`);
  }
}

async function main() {
  const configOnly = process.argv.includes("--config-only");

  for (const slide of [...TIKTOK_STORY, ...FEATURE_ADS, ...CREATOR_CAMPAIGN]) {
    if (!slide.screen) failures.push(`Slide ohne App-Screen: ${slide.id}`);
    if (slide.layout === "emotional" || slide.layout === "emotional-hero") {
      failures.push(`Textfolien-Layout verboten: ${slide.id}`);
    }
  }

  if (configOnly) {
    if (failures.length) {
      for (const f of failures) console.error(`  - ${f}`);
      process.exit(1);
    }
    console.log("\u2713 Config Pre-Check OK");
    return;
  }

  console.log("Marketing v3 Qualitaetspruefung...\n");

  walkText(MARKETING_ROOT);
  walkText(join(root, "scripts", "marketing"));

  for (const screenId of allRequiredScreens()) {
    const p = join(dirs.raw, `${screenId}.png`);
    if (!existsSync(p)) failures.push(`Raw-Screen fehlt: ${screenId}`);
  }

  for (const item of allRequiredOutputs()) {
    if (item.optional) continue;

    if (item.animation) {
      const webm = item.path;
      const webp = webm.replace(/\.webm$/, ".webp");
      const gif = webm.replace(/\.webm$/, ".gif");
      if (!existsSync(webm) && !existsSync(webp) && !existsSync(gif)) {
        failures.push(`Animation fehlt: ${item.animation.id}`);
      }
      continue;
    }

    if (!existsSync(item.path)) {
      failures.push(`Fehlt: ${item.path}`);
      continue;
    }
    if (item.path.endsWith(".png")) {
      await checkPngQuality(item.path);
    }
  }

  const checks = [
    "Keine Encodingfehler",
    "Keine Platzhalter",
    "Kein Dokumentationsstil",
    "Keine Textfolien",
    "App im Mittelpunkt",
    "Premium-Optik",
    "Social-Media-Assets komplett",
    "Animationen vorhanden",
  ];

  if (failures.length) {
    console.error("\n\u2717 Validierung fehlgeschlagen:\n");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  for (const c of checks) passed.push(c);
  console.log("\u2713 Alle Checks bestanden:\n");
  for (const c of passed) console.log(`  \u2713 ${c}`);
  console.log(`\n  Outputs: ${allRequiredOutputs().length} Dateien`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

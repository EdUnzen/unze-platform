#!/usr/bin/env node
/**
 * Qualit\u00e4ts-Gate f\u00fcr Marketing-Assets.
 * Usage: npm run marketing:validate
 */
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import sharp from "sharp";
import { CREATOR_STORY, SOCIAL_EXPORTS, dirs, root } from "./config.mjs";

const MARKETING_ROOT = join(root, "docs", "marketing");
const TEXT_EXTS = new Set([".md", ".html", ".json", ".mjs"]);
const SKIP_DIRS = new Set(["templates", "graphics", "screenshots"]);

const MOJIBAKE = [/\uFFFD/, /[\u0080-\u009F]/, /f\uFFFDr/, /\uFFFDffnen/, /Men\uFFFD/, /Schlie\uFFFDen/];

const PLACEHOLDER_PATTERNS = [
  /Lorem ipsum/i,
  /placeholder/i,
  /dummy/i,
  /TODO:/i,
  /FIXME:/i,
  /debug/i,
  /\[TBD\]/i,
  /Fragezeichen-Platzhalter/,
  /#00ff00/i,
  /background:\s*#0f766e/i,
  /green screen/i,
];

/** @type {string[]} */
const failures = [];

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
          failures.push(`Encoding: ${p} (${re})`);
          break;
        }
      }
      if (extname(name) === ".html" && /[\\/]engine[\\/]/.test(p)) {
        for (const re of PLACEHOLDER_PATTERNS) {
          if (re.test(text)) failures.push(`Platzhalter: ${p} (${re})`);
        }
      }
    }
  }
}

async function checkPngNotGreenDominant(filePath) {
  const { data, info } = await sharp(filePath)
    .resize(120, 120, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let greenish = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (g > 140 && g > r * 1.4 && g > b * 1.4) greenish++;
  }
  const ratio = greenish / pixels;
  if (ratio > 0.55) {
    failures.push(`Gr\u00fcner Platzhalter-Verdacht: ${filePath} (${(ratio * 100).toFixed(0)}% gr\u00fcn)`);
  }
}

async function checkRequiredOutputs() {
  for (const slide of CREATOR_STORY) {
    for (const sub of ["story", "carousel", "reels"]) {
      const p = join(dirs.output, sub, `${slide.id}.png`);
      if (!existsSync(p)) failures.push(`Fehlt: ${p}`);
    }
  }
  for (const item of SOCIAL_EXPORTS) {
    const p = join(dirs.output, `${item.id}.png`);
    if (!existsSync(p)) failures.push(`Fehlt: ${p}`);
  }
}

async function checkRawScreens() {
  for (const slide of CREATOR_STORY) {
    const p = join(dirs.raw, `${slide.screen}.png`);
    if (!existsSync(p)) failures.push(`Raw-Screen fehlt: ${p}`);
  }
}

async function main() {
  console.log("Marketing Qualit\u00e4tspr\u00fcfung...\n");

  walkText(MARKETING_ROOT);
  walkText(join(root, "scripts", "marketing"));

  await checkRequiredOutputs();
  await checkRawScreens();

  const pngDirs = [
    join(dirs.output, "story"),
    join(dirs.output, "carousel"),
    join(dirs.output, "reels"),
    dirs.output,
  ];

  for (const dir of pngDirs) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".png")) continue;
      await checkPngNotGreenDominant(join(dir, name));
    }
  }

  if (failures.length) {
    console.error("\n\u2717 Marketing-Validierung fehlgeschlagen:\n");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log("\u2713 Alle Marketing-Checks bestanden.");
  console.log(`  Story-Slides: ${CREATOR_STORY.length}`);
  console.log(`  Formate: TikTok/Reels/Stories (9:16), Carousel (1:1), LinkedIn, Facebook, Hero, Presse`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

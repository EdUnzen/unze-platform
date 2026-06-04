#!/usr/bin/env node
/**
 * Erzeugt transparente Logo- und Icon-Assets aus dem Designsystem.
 * Usage: node scripts/generate-brand-assets.mjs
 */
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

const root = process.cwd();
const SOURCE = join(root, "01_Designsystem", "Logo App, Favicon, etc.png");

const WHITE_THRESHOLD = 248;

async function removeWhiteBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function writePng(buffer, outPath, width, height, fit = "contain") {
  await sharp(buffer)
    .trim()
    .resize(width, height, {
      fit,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error("✗ Quelle fehlt:", SOURCE);
    process.exit(1);
  }

  console.log("\n=== UNZE Brand Assets ===\n");
  const transparent = await removeWhiteBackground(SOURCE);

  const outputs = [
    ["public/brand/unze-logo.png", 512, 512, "contain"],
    ["public/brand/unze-mark.png", 256, 256, "contain"],
    ["public/icons/icon-192.png", 192, 192, "cover"],
    ["public/icons/icon-512.png", 512, 512, "cover"],
    ["app/icon.png", 32, 32, "cover"],
    ["app/apple-icon.png", 180, 180, "cover"],
  ];

  for (const [rel, w, h, fit] of outputs) {
    const out = join(root, rel);
    await mkdir(join(out, ".."), { recursive: true });
    await writePng(transparent, out, w, h, fit);
    console.log(`✓ ${rel}`);
  }

  console.log("\nFertig — transparenter Hintergrund, keine weiße Box.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

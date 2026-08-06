#!/usr/bin/env node
/**
 * Laedt Manus-CDN-Assets lokal fuer die Landingpage-Migration.
 */
import { mkdir, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";

const OUT = join(process.cwd(), "public", "landing");

const ASSETS = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031591105/Vvpir7UGi2ufSokDuyfwvf/unze-logo_69db6ea8.png",
    file: "unze-logo.png",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031591105/Vvpir7UGi2ufSokDuyfwvf/hero-light-iooL3BNukBHhhg6Wv3xM4f.webp",
    file: "hero-light.webp",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031591105/Vvpir7UGi2ufSokDuyfwvf/about-people-auYjTqs5oBxEQQ3Hjjsi9u.webp",
    file: "about-people.webp",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031591105/Vvpir7UGi2ufSokDuyfwvf/cta-community-3wHeFQKquMdmduinyB93JC.webp",
    file: "cta-community.webp",
  },
  {
    url: "https://www.unze.app/favicon.ico",
    file: "favicon.ico",
  },
  {
    url: "https://www.unze.app/apple-touch-icon.png",
    file: "apple-touch-icon.png",
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const { url, file } of ASSETS) {
    const dest = join(OUT, file);
    try {
      await download(url, dest);
      console.log(`  OK ${file}`);
    } catch (err) {
      console.warn(`  SKIP ${file}: ${err.message}`);
    }
  }
  await writeFile(
    join(OUT, "manifest-source.json"),
    JSON.stringify({ migratedFrom: "www.unze.app", assets: ASSETS.map((a) => a.file) }, null, 2),
    "utf8",
  );
  console.log("\nAssets: public/landing/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

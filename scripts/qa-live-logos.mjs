#!/usr/bin/env node
import fs from "fs";

const dir = "_tmp";
fs.mkdirSync(dir, { recursive: true });

const assets = [
  "https://www.unze.app/media/products/my-organizer-ai.png",
  "https://www.unze.app/brand/unze-connect-logo.png",
  "https://www.unze.app/brand/unze-logo.png",
  "https://www.unze.app/landing/unze-logo.png",
  "https://www.unze.app/media/showcase/connect/discover.png",
  "https://www.unze.app/media/showcase/connect/dashboard.png",
];

for (const url of assets) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const name = url.split("/").pop();
  fs.writeFileSync(`${dir}/${name}`, buf);
  console.log(res.status, name, buf.length);
}

const page = await fetch("https://www.unze.app/business/produkte");
const html = await page.text();
console.log("produkte", page.status);
const imgSrcs = [...html.matchAll(/src="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => /organizer|brand|logo|connect|product/i.test(s));
console.log("product imgs", [...new Set(imgSrcs)]);

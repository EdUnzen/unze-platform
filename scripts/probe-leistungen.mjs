#!/usr/bin/env node
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3002";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];

page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`CON: ${m.text()}`);
});

await page.goto(`${base}/business`, { waitUntil: "networkidle", timeout: 60000 });
await page.locator('a[href="/business/leistungen"]').first().click();
await page.waitForURL("**/business/leistungen", { timeout: 30000 });
await page.waitForTimeout(2500);

const text = await page.innerText("body");
console.log("errorUI", text.includes("Etwas ist schiefgelaufen"));
console.log("hero", text.includes("Digitale L"));
console.log("referenz", text.includes("Entwickelte"));
console.log("errors", errors.slice(0, 10));

await browser.close();

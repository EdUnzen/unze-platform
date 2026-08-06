import { chromium } from "playwright";

const urls = [
  "http://localhost:3000/business",
  "http://localhost:3000/",
  "http://localhost:3000/studio/app/uebersicht",
];

const browser = await chromium.launch({
  headless: true,
  channel: "msedge",
});

const page = await browser.newPage();
const allErrors = [];

for (const url of urls) {
  const errors = [];
  const pageErrors = [];

  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("requestfailed");

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("requestfailed", (req) => {
    if (req.url().includes("_next/") || req.url().includes("localhost")) {
      errors.push(`REQUEST FAILED: ${req.url()} — ${req.failure()?.errorText ?? "unknown"}`);
    }
  });

  console.log(`\n=== ${url} ===`);
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    console.log("HTTP:", response?.status());
    await page.waitForTimeout(3000);

    const overlayText = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    if (/Runtime TypeError|Unhandled Runtime Error|Application error|Internal Server Error/i.test(overlayText)) {
      const match = overlayText.match(/(.{0,120}(Runtime TypeError|Unhandled Runtime Error|Application error).{0,200})/i);
      console.log("OVERLAY TEXT:", match?.[1]?.replace(/\s+/g, " ").trim());
    }

    const dialog = page.locator("[data-nextjs-dialog], nextjs-portal");
    if ((await dialog.count()) > 0) {
      console.log("NEXT ERROR DIALOG VISIBLE");
      const dlg = await dialog.first().innerText().catch(() => "");
      console.log(dlg.slice(0, 500).replace(/\s+/g, " "));
    }

    if (pageErrors.length) {
      console.log("PAGE ERRORS:");
      pageErrors.forEach((e) => console.log(" -", e.slice(0, 500)));
      allErrors.push(...pageErrors.map((e) => `${url}: ${e}`));
    }
    if (errors.length) {
      console.log("CONSOLE ERRORS:");
      errors.slice(0, 10).forEach((e) => console.log(" -", e.slice(0, 500)));
      allErrors.push(...errors.map((e) => `${url}: ${e}`));
    }
    if (!pageErrors.length && !errors.length) console.log("OK — keine Client-Fehler");
  } catch (err) {
    console.log("NAV ERROR:", err.message);
    allErrors.push(`${url}: ${err.message}`);
  }
}

await browser.close();
if (allErrors.length) process.exit(1);

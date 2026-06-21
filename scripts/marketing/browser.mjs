export async function launchBrowser() {
  const { chromium } = await import("playwright");
  for (const channel of ["chrome", "msedge", undefined]) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch {
      continue;
    }
  }
  throw new Error("Kein Browser verf\u00fcgbar (Chrome/Edge oder playwright install chromium)");
}

export async function createMarketingContext(browser, { width, height, mobile = true }) {
  return browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 3,
    isMobile: mobile,
    hasTouch: mobile,
    locale: "de-DE",
  });
}

export async function preparePage(page) {
  await page.addInitScript(() => {
    localStorage.setItem("unze-onboarding-complete-v1", "1");
    localStorage.setItem("unze-pwa-install-dismissed", "1");
  });
}

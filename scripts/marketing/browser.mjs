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

export async function hideLegacyMarketingUI(page) {
  await page.evaluate(() => {
    const hide = (el) => {
      if (el instanceof HTMLElement) el.style.setProperty("display", "none", "important");
    };

    document.querySelectorAll("[data-marketing-overlay], [aria-label='App installieren']").forEach(hide);

    document.querySelectorAll('[role="dialog"]').forEach((d) => {
      hide(d.closest(".fixed") ?? d);
    });

    document.querySelectorAll('[role="presentation"].fixed').forEach(hide);

    for (const el of document.querySelectorAll("button, a")) {
      const text = el.textContent?.trim() ?? "";
      if (text.includes("Was ist UNZE?")) {
        hide(el.closest("div.rounded-2xl") ?? el.closest("section") ?? el);
      }
    }
  });
}

export async function prepareMarketingPage(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("unze-marketing-mode", "1");
    document.documentElement.dataset.marketingMode = "true";
    localStorage.setItem("unze-onboarding-complete-v1", "1");
    localStorage.setItem("unze-pwa-install-dismissed", "1");

    const style = document.createElement("style");
    style.id = "unze-marketing-capture-css";
    style.textContent = `
      html[data-marketing-mode="true"] [data-marketing-overlay],
      html[data-marketing-mode="true"] [aria-label="App installieren"] { display: none !important; }
    `;
    document.head.appendChild(style);
  });
}

/** @deprecated Alias fuer prepareMarketingPage */
export const preparePage = prepareMarketingPage;

export const OVERLAY_SELECTORS = [
  'text="Was ist UNZE?"',
  'text="UNZE als App installieren"',
  'text="Zum Home-Bildschirm"',
];

export async function hideNextDevIndicators(page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      #__next-build-watcher,
      [data-next-mark],
      [class*="nextjs-static-indicator"],
      [class*="dev-tools"],
      button[aria-label*="Next.js"],
      #devtools-indicator {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  });

  await page.evaluate(() => {
    const hide = (el) => {
      if (el instanceof HTMLElement) el.style.setProperty("display", "none", "important");
    };

    for (const el of document.querySelectorAll("body *")) {
      if (!(el instanceof HTMLElement)) continue;
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim() ?? "";
      const isCornerBadge =
        rect.width > 0 &&
        rect.width <= 56 &&
        rect.height > 0 &&
        rect.height <= 56 &&
        rect.left <= 24 &&
        rect.bottom >= window.innerHeight - 24 &&
        (text === "N" || el.getAttribute("aria-label")?.includes("Next.js") === true);

      if (isCornerBadge) hide(el);
    }
  });
}
export async function assertNoOverlays(page, routeId) {
  await hideLegacyMarketingUI(page);
  await page.waitForTimeout(300);
  for (const sel of OVERLAY_SELECTORS) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false);
    if (visible) {
      throw new Error(`${routeId}: Overlay sichtbar (${sel})`);
    }
  }
}

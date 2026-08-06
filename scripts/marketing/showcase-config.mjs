import { readFileSync } from "fs";
import { join } from "path";
import { root } from "./config.mjs";

export const LOCAL_BASE = process.env.MARKETING_LOCAL_BASE ?? "http://localhost:3000";
export const CONNECT_LIVE_BASE = process.env.E2E_BASE_URL ?? "https://www.unzeconnect.app";
export const BUSINESS_LIVE_BASE = process.env.MARKETING_BUSINESS_BASE ?? "https://www.unze.app";

export const BASE_MAP = {
  local: LOCAL_BASE,
  "connect-live": CONNECT_LIVE_BASE,
  "business-live": BUSINESS_LIVE_BASE,
};

export const VIEWPORTS = {
  mobile: { width: 390, height: 844, mobile: true, suffix: "" },
  desktop: { width: 1440, height: 900, mobile: false, suffix: "-desktop" },
  ipad: { width: 820, height: 1180, mobile: true, suffix: "-ipad" },
};

export const showcaseDirs = {
  root: join(root, "docs", "marketing", "raw-screens", "showcase"),
  manifest: join(root, "docs", "marketing", "raw-screens", "showcase", "manifest.json"),
  catalog: join(root, "docs", "marketing", "showcase-catalog.json"),
  outputEbay: join(root, "docs", "marketing", "output", "ebay"),
};

export function loadShowcaseCatalog() {
  const raw = readFileSync(showcaseDirs.catalog, "utf8");
  return JSON.parse(raw);
}

export function resolveBase(item) {
  return BASE_MAP[item.base] ?? LOCAL_BASE;
}

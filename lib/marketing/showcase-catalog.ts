import catalogJson from "@/docs/marketing/showcase-catalog.json";

export type ShowcaseCategoryId = "business" | "connect" | "studio" | "template";
export type ShowcaseAuth = null | "connect" | "studio";
export type ShowcasePriority = "high" | "medium" | "low";
export type ShowcaseStatus = "ready" | "partial" | "planned";
export type ShowcaseViewport = "desktop" | "mobile" | "ipad";
export type ShowcaseBase = "local" | "connect-live" | "business-live";

export interface ShowcaseCategory {
  id: ShowcaseCategoryId;
  label: string;
  description: string;
}

export interface ShowcaseItem {
  id: string;
  category: ShowcaseCategoryId;
  title: string;
  description: string;
  route: string;
  base: ShowcaseBase;
  marketingMode: boolean;
  auth: ShowcaseAuth;
  viewports: ShowcaseViewport[];
  fullPage: boolean;
  publishPaket: string[];
  priority: ShowcasePriority;
  status: ShowcaseStatus;
  exportHint?: string;
  note?: string;
  skipCapture?: boolean;
}

export interface ShowcaseCatalog {
  version: number;
  updatedAt: string;
  categories: ShowcaseCategory[];
  items: ShowcaseItem[];
}

export const SHOWCASE_CATALOG = catalogJson as ShowcaseCatalog;

export function getShowcaseCategories(): ShowcaseCategory[] {
  return SHOWCASE_CATALOG.categories;
}

export function getShowcaseItems(filter?: {
  category?: ShowcaseCategoryId;
  priority?: ShowcasePriority;
  captureOnly?: boolean;
}): ShowcaseItem[] {
  let items = SHOWCASE_CATALOG.items;

  if (filter?.captureOnly) {
    items = items.filter((item) => !item.skipCapture);
  }
  if (filter?.category) {
    items = items.filter((item) => item.category === filter.category);
  }
  if (filter?.priority) {
    items = items.filter((item) => item.priority === filter.priority);
  }

  return items;
}

export function getShowcaseItem(id: string): ShowcaseItem | undefined {
  return SHOWCASE_CATALOG.items.find((item) => item.id === id);
}

export function buildShowcasePreviewUrl(item: ShowcaseItem, origin = "http://localhost:3000"): string {
  const url = new URL(item.route, origin);
  if (item.marketingMode) {
    url.searchParams.set("marketing", "1");
  }
  return url.toString();
}

export function getShowcaseStats() {
  const items = getShowcaseItems({ captureOnly: true });
  const byCategory = Object.fromEntries(
    SHOWCASE_CATALOG.categories.map((cat) => [
      cat.id,
      items.filter((i) => i.category === cat.id).length,
    ]),
  ) as Record<ShowcaseCategoryId, number>;

  return {
    total: items.length,
    ready: items.filter((i) => i.status === "ready").length,
    highPriority: items.filter((i) => i.priority === "high").length,
    byCategory,
  };
}

export const SHOWCASE_CAPTURE_COMMANDS = {
  all: "npm run marketing:capture:showcase",
  business: "npm run marketing:capture:business",
  connect: "npm run marketing:capture:connect",
  studio: "npm run marketing:capture:studio",
  overload: "npm run marketing:capture:overload",
  legacyConnect: "npm run marketing:capture",
} as const;

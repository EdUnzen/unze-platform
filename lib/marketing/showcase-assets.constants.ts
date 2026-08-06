import type { ShowcaseItem, ShowcaseViewport } from "@/lib/marketing/showcase-catalog";

export const SHOWCASE_ASSET_PATHS = {
  /** Checkliste & Links — keine Dateien, nur Navigation */
  studioUi: "/studio/app/marketing",
  /** Showcase-Screenshots (Business, Studio, Connect, Templates) */
  showcaseScreens: "docs/marketing/raw-screens/showcase/",
  /** Connect Legacy-Screenshots (marketing:capture) */
  connectScreens: "docs/marketing/raw-screens/marketing/",
  /** Fertige Werbevideos (Slideshow-Pipeline) */
  videos: "docs/marketing/output/videos/",
  /** Connect Mockups: TikTok, Reels, Features */
  connectMockups: "docs/marketing/output/",
  /** Portfolio-Screenshots (3 Viewports) */
  portfolio: "docs/marketing/screenshots/marketing/",
  /** eBay-Export manuell */
  ebayExport: "docs/marketing/output/ebay/",
} as const;

export const SHOWCASE_VIDEO_COMMANDS = {
  all: "npm run marketing:video:slideshow",
  business: "npm run marketing:video:business",
  studio: "npm run marketing:video:studio",
  connect: "npm run marketing:video:connect",
  overview: "npm run marketing:video:slideshow -- --id=unze-overview-reel",
} as const;

export const SHOWCASE_SLIDESHOWS = [
  { id: "business-reel", title: "Business Werbevideo (9:16)", format: "vertical" },
  { id: "studio-reel", title: "Studio Werbevideo (9:16)", format: "vertical" },
  { id: "connect-reel", title: "Connect Werbevideo (9:16)", format: "vertical" },
  { id: "unze-overview-reel", title: "Gesamtüberblick (9:16)", format: "vertical" },
  { id: "business-linkedin", title: "Business LinkedIn (16:9)", format: "horizontal" },
] as const;

export interface ShowcaseAssetStatus {
  item: ShowcaseItem;
  captured: ShowcaseViewport[];
  missing: ShowcaseViewport[];
}

export interface ShowcaseCaptureSummary {
  itemsWithCaptures: number;
  totalItems: number;
  totalImageFiles: number;
  hasVideos: boolean;
  hasLegacyConnect: boolean;
  showcaseDirExists: boolean;
}

export function showcaseImageRelativePath(
  item: ShowcaseItem,
  viewport: ShowcaseViewport,
): string {
  const suffix =
    viewport === "desktop" ? "-desktop" : viewport === "ipad" ? "-ipad" : "";
  return `${SHOWCASE_ASSET_PATHS.showcaseScreens}${item.category}/${item.id}${suffix}.png`;
}

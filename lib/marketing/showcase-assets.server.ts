import "server-only";

import { existsSync } from "fs";
import { join } from "path";
import { getShowcaseItems, type ShowcaseItem, type ShowcaseViewport } from "@/lib/marketing/showcase-catalog";
import {
  SHOWCASE_ASSET_PATHS,
  type ShowcaseAssetStatus,
  type ShowcaseCaptureSummary,
} from "@/lib/marketing/showcase-assets.constants";

const PROJECT_ROOT = process.cwd();

function viewportSuffix(viewport: ShowcaseViewport): string {
  if (viewport === "desktop") return "-desktop";
  if (viewport === "ipad") return "-ipad";
  return "";
}

export function getShowcaseImagePath(item: ShowcaseItem, viewport: ShowcaseViewport): string {
  return join(
    PROJECT_ROOT,
    SHOWCASE_ASSET_PATHS.showcaseScreens,
    item.category,
    `${item.id}${viewportSuffix(viewport)}.png`,
  );
}

export function getShowcaseAssetStatuses(): ShowcaseAssetStatus[] {
  return getShowcaseItems({ captureOnly: true }).map((item) => {
    const captured: ShowcaseViewport[] = [];
    const missing: ShowcaseViewport[] = [];

    for (const viewport of item.viewports) {
      const path = getShowcaseImagePath(item, viewport);
      if (existsSync(path)) {
        captured.push(viewport);
      } else {
        missing.push(viewport);
      }
    }

    return { item, captured, missing };
  });
}

export function getShowcaseCaptureSummary(): ShowcaseCaptureSummary {
  const statuses = getShowcaseAssetStatuses();
  const withFiles = statuses.filter((s) => s.captured.length > 0).length;
  const totalFiles = statuses.reduce((sum, s) => sum + s.captured.length, 0);

  const videoDir = join(PROJECT_ROOT, SHOWCASE_ASSET_PATHS.videos);
  const hasVideos = existsSync(videoDir);

  const legacyDir = join(PROJECT_ROOT, SHOWCASE_ASSET_PATHS.connectScreens);
  const hasLegacyConnect = existsSync(join(legacyDir, "home.png"));

  return {
    itemsWithCaptures: withFiles,
    totalItems: statuses.length,
    totalImageFiles: totalFiles,
    hasVideos,
    hasLegacyConnect,
    showcaseDirExists: existsSync(join(PROJECT_ROOT, SHOWCASE_ASSET_PATHS.showcaseScreens)),
  };
}

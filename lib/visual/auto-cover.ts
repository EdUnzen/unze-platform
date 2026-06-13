/**
 * Auto-Cover-System — einheitliche Priorität für alle Entitäten.
 *
 * 1. Nutzerbild (Upload) — immer wenn vorhanden
 * 2. Auto-Cover — Kategorie-Preset (nur ohne Nutzerbild)
 * 3. UNZE Standard-Fallback
 */

import {
  BANNER_PRESETS,
  getBannerPresetById,
  getDefaultBannerPresetForCategory,
} from "@/lib/constants/category-banners";
import { isUsableImageUrl } from "@/lib/visual/image-url";
import { normalizeBannerGradient } from "@/lib/visual/normalize-cover";

export type CoverEntityKind = "community" | "group" | "service" | "event";

/** Kategorie → Preset-ID für Auto-Cover (wenn kein direkter Match in BANNER_PRESETS) */
const CATEGORY_PRESET_ID: Record<string, string> = {
  Gaming: "gaming-1",
  Business: "business-1",
  Finanzen: "finanzen-1",
  Fitness: "fitness-1",
  Bildung: "bildung-1",
  Musik: "musik-1",
  Creator: "creator-1",
  Entertainment: "creator-1",
  Coaching: "coaching-1",
  Dienstleistungen: "coaching-1",
  Sport: "sport-1",
  Technologie: "tech-1",
  Kreativität: "creative-1",
  Lifestyle: "lifestyle-1",
  "Lokale Community": "general-2",
  Allgemein: "general-2",
};

const UNZE_STANDARD_PRESET_ID = "general-3";

export type ResolvedCover = {
  /** Nur Nutzer-Upload — null wenn keins */
  primaryImageUrl: string | null;
  /** Auto-Cover aus Kategorie (Stufe 2) */
  autoCoverUrl: string;
  /** UNZE Standard (Stufe 3) */
  standardCoverUrl: string;
  gradient: string;
};

function presetForCategory(category: string, kind?: CoverEntityKind): {
  imageUrl: string;
  gradient: string;
} {
  if (kind === "service") {
    const servicePreset =
      getBannerPresetById("coaching-1") ?? getDefaultBannerPresetForCategory("Coaching");
    return { imageUrl: servicePreset.imageUrl, gradient: servicePreset.gradient };
  }

  const mappedId = CATEGORY_PRESET_ID[category];
  if (mappedId) {
    const preset = getBannerPresetById(mappedId);
    if (preset) return { imageUrl: preset.imageUrl, gradient: preset.gradient };
  }

  const preset = getDefaultBannerPresetForCategory(category);
  return { imageUrl: preset.imageUrl, gradient: preset.gradient };
}

function standardPreset() {
  return (
    getBannerPresetById(UNZE_STANDARD_PRESET_ID) ??
    BANNER_PRESETS.find((p) => p.id === "general-1")!
  );
}

export function resolveAutoCover(input: {
  userImageUrl?: string | null;
  category: string;
  bannerGradient?: string | null;
  kind?: CoverEntityKind;
}): ResolvedCover {
  const auto = presetForCategory(input.category, input.kind);
  const standard = standardPreset();
  const gradient = normalizeBannerGradient(
    input.bannerGradient ?? auto.gradient,
    input.category,
  );

  return {
    primaryImageUrl: isUsableImageUrl(input.userImageUrl)
      ? input.userImageUrl!.trim()
      : null,
    autoCoverUrl: auto.imageUrl,
    standardCoverUrl: standard.imageUrl,
    gradient,
  };
}

export function resolveCommunityCover(community: {
  bannerUrl?: string | null;
  bannerGradient: string;
  category: string;
}): ResolvedCover {
  return resolveAutoCover({
    userImageUrl: community.bannerUrl,
    category: community.category,
    bannerGradient: community.bannerGradient,
    kind: "community",
  });
}

export function resolveGroupOrServiceCover(group: {
  coverUrl?: string | null;
  bannerGradient: string;
  category: string;
  groupType?: "group" | "service";
}): ResolvedCover {
  return resolveAutoCover({
    userImageUrl: group.coverUrl,
    category: group.category,
    bannerGradient: group.bannerGradient,
    kind: group.groupType === "service" ? "service" : "group",
  });
}

export function resolveEventCover(input: {
  coverUrl?: string | null;
  communityCategory: string;
  communityBannerUrl?: string | null;
  communityGradient?: string;
}): ResolvedCover {
  const eventOwn = resolveAutoCover({
    userImageUrl: input.coverUrl,
    category: input.communityCategory,
    bannerGradient: input.communityGradient,
    kind: "event",
  });

  if (eventOwn.primaryImageUrl) return eventOwn;

  const communityFallback = resolveAutoCover({
    userImageUrl: input.communityBannerUrl,
    category: input.communityCategory,
    bannerGradient: input.communityGradient,
    kind: "community",
  });

  return {
    primaryImageUrl: null,
    autoCoverUrl: eventOwn.autoCoverUrl,
    standardCoverUrl: communityFallback.autoCoverUrl || eventOwn.standardCoverUrl,
    gradient: eventOwn.gradient,
  };
}

/** Für Cover-Komponenten: Kandidaten-URLs in Prioritätsreihenfolge */
export function coverImageCandidates(cover: ResolvedCover): string[] {
  const list: string[] = [];
  if (cover.primaryImageUrl) list.push(cover.primaryImageUrl);
  if (!list.includes(cover.autoCoverUrl)) list.push(cover.autoCoverUrl);
  if (!list.includes(cover.standardCoverUrl)) list.push(cover.standardCoverUrl);
  return list;
}

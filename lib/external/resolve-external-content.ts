import type { PlatformType } from "@/types/community";
import { PLATFORM_LABELS } from "@/lib/constants/platforms";

export type ExternalContentMode = "iframe" | "link";

export interface ResolvedExternalContent {
  originalUrl: string;
  platform: PlatformType;
  platformLabel: string;
  mode: ExternalContentMode;
  embedUrl?: string;
  previewImageUrl?: string;
  host: string;
}

const HOST_PATTERNS: { test: RegExp; platform: PlatformType }[] = [
  { test: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, platform: "youtube" },
  { test: /(^|\.)tiktok\.com$/i, platform: "tiktok" },
  { test: /(^|\.)instagram\.com$/i, platform: "instagram" },
  { test: /(^|\.)facebook\.com$|(^|\.)fb\.watch$/i, platform: "facebook" },
  { test: /(^|\.)discord\.(com|gg)$/i, platform: "discord" },
  { test: /(^|\.)t\.me$|(^|\.)telegram\.(org|me)$/i, platform: "telegram" },
  { test: /(^|\.)whatsapp\.com$|(^|\.)wa\.me$/i, platform: "whatsapp" },
];

function parseHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function detectPlatform(host: string): PlatformType {
  for (const { test, platform } of HOST_PATTERNS) {
    if (test.test(host)) return platform;
  }
  return "website";
}

function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
    if (embed) return embed[1];
    const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
    if (shorts) return shorts[1];
  } catch {
    return null;
  }
  return null;
}

function parseTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match?.[1] ?? null;
}

/** Erkennt externe Plattform-URLs — kein Download/Re-Upload, nur Embed/Link */
export function resolveExternalContent(rawUrl: string): ResolvedExternalContent | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  const host = parseHost(normalized);
  if (!host) return null;

  const platform = detectPlatform(host);
  const platformLabel = PLATFORM_LABELS[platform];

  if (platform === "youtube") {
    const videoId = parseYouTubeId(normalized);
    if (videoId) {
      return {
        originalUrl: normalized,
        platform,
        platformLabel,
        mode: "iframe",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        previewImageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        host,
      };
    }
  }

  if (platform === "tiktok") {
    const videoId = parseTikTokId(normalized);
    if (videoId) {
      return {
        originalUrl: normalized,
        platform,
        platformLabel,
        mode: "iframe",
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        host,
      };
    }
  }

  return {
    originalUrl: normalized,
    platform,
    platformLabel,
    mode: "link",
    host,
  };
}

export function isExternalPlatformUrl(url: string): boolean {
  return resolveExternalContent(url) !== null;
}

/** URLs von Drittplattformen gehören nicht in media[] (kein Re-Upload) */
export function shouldTreatAsExternalLink(url: string): boolean {
  const resolved = resolveExternalContent(url);
  if (!resolved) return false;
  return ["youtube", "tiktok", "instagram", "facebook"].includes(resolved.platform);
}

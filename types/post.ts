/** Community-Content-Posts — Medien & Metadaten */

export type PostMediaType = "image" | "video";

export type PostMediaSource = "hosted" | "external";

export interface PostMediaItem {
  type: PostMediaType;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  durationSec?: number;
  sortOrder?: number;
  /** external = nur Verweis/Vorschau, kein UNZE-Re-Upload */
  source?: PostMediaSource;
}

export type PostContentSource = "unze" | "external_embed" | "external_link";

export interface PostMetadata {
  eventAt?: string;
  location?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Primärer externer Inhalt (YouTube, TikTok, …) */
  externalUrl?: string;
  externalPlatform?: string;
  contentSource?: PostContentSource;
}

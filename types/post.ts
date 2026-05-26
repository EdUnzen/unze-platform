/** Community-Content-Posts — Medien & Metadaten */

export type PostMediaType = "image" | "video";

export interface PostMediaItem {
  type: PostMediaType;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  durationSec?: number;
  sortOrder?: number;
}

export interface PostMetadata {
  eventAt?: string;
  location?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

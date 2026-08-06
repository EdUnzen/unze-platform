import type { PostType } from "@/types/database";

/**
 * Organisations-Feed — keine Social-Media-Typen (kein Clip, Umfrage, Suche, …).
 * Services werden als Community News / Ankündigung mit Link veröffentlicht.
 */
export const FEED_POST_TYPES: PostType[] = [
  "text",
  "community_update",
  "event",
  "image",
];

export function isFeedPostType(type: PostType): boolean {
  return FEED_POST_TYPES.includes(type);
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  text: "Ankündigung",
  image: "Ankündigung mit Bild",
  gallery: "Bilderserie",
  video: "Video",
  clip: "Clip",
  poll: "Umfrage",
  event: "Event",
  community_update: "Community-Ankündigung",
  highlight: "Highlight",
  question: "Frage",
  request: "Suche / Anfrage",
};

export const POST_TYPE_DESCRIPTIONS: Partial<Record<PostType, string>> = {
  text: "Offizielle Ankündigung oder Update",
  image: "Ankündigung mit einem Bild",
  event: "Termin, Turnier oder Live-Session",
  community_update: "Community-Ankündigung oder Serviceangebot",
};

/** Composer — nur Feed-konforme Typen */
export const COMPOSER_POST_TYPES: PostType[] = [...FEED_POST_TYPES];

export const POST_TYPE_STYLES: Record<PostType, string> = {
  text: "bg-unze-surface-muted text-unze-ink-secondary",
  image: "bg-sky-100 text-sky-800",
  gallery: "bg-sky-100 text-sky-800",
  video: "bg-unze-surface-muted text-unze-ink-muted",
  clip: "bg-unze-surface-muted text-unze-ink-muted",
  poll: "bg-amber-100 text-amber-800",
  event: "bg-orange-100 text-orange-800",
  community_update: "bg-unze-green-muted text-unze-green-dark",
  highlight: "bg-unze-surface-muted text-unze-ink-muted",
  question: "bg-unze-surface-muted text-unze-ink-muted",
  request: "bg-emerald-100 text-emerald-800",
};

import type { PostType } from "@/types/database";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  text: "Text",
  image: "Bild",
  gallery: "Bilderserie",
  video: "Video",
  clip: "Clip",
  poll: "Umfrage",
  event: "Event",
  community_update: "Community-News",
  highlight: "Highlight",
  question: "Frage",
  request: "Suche / Anfrage",
};

export const POST_TYPE_DESCRIPTIONS: Partial<Record<PostType, string>> = {
  text: "Update, Gedanken oder Ankündigung",
  image: "Einzelnes Bild mit Text",
  gallery: "Mehrere Bilder — swipebar",
  video: "Video-Beitrag",
  clip: "Kurzer Clip oder Highlight",
  event: "Turnier, Meetup, Live-Session",
  community_update: "Offizielle Community-News",
  highlight: "Best-of, Montage, Wochenhighlight",
  question: "Frage an die Community",
  request: "z. B. Mate gesucht, Collab-Anfrage",
};

/** Composer — häufigste Community-Content-Typen */
export const COMPOSER_POST_TYPES: PostType[] = [
  "text",
  "community_update",
  "event",
  "request",
  "highlight",
  "clip",
  "gallery",
  "image",
  "video",
  "question",
];

export const POST_TYPE_STYLES: Record<PostType, string> = {
  text: "bg-unze-surface-muted text-unze-ink-secondary",
  image: "bg-sky-100 text-sky-800",
  gallery: "bg-sky-100 text-sky-800",
  video: "bg-violet-100 text-violet-800",
  clip: "bg-violet-100 text-violet-800",
  poll: "bg-amber-100 text-amber-800",
  event: "bg-orange-100 text-orange-800",
  community_update: "bg-unze-green-muted text-unze-green-dark",
  highlight: "bg-fuchsia-100 text-fuchsia-800",
  question: "bg-indigo-100 text-indigo-800",
  request: "bg-emerald-100 text-emerald-800",
};

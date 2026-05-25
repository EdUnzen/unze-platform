import type { FeedPost } from "@/lib/mappers/post.mapper";

export const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: "mock-post-1",
    authorId: "mock-creator-1",
    communityId: "mock-1",
    postType: "community_update",
    title: "Willkommen im Creator Hub",
    content:
      "Neue Mitglieder: Bitte stellt euch kurz vor — wer bist du und welche Community baust du gerade?",
    visibility: "public",
    likeCount: 124,
    commentCount: 38,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-post-2",
    authorId: "mock-creator-2",
    communityId: "mock-2",
    postType: "text",
    title: "Wöchentlicher Check-in",
    content:
      "Montag = Reset-Tag. Was ist euer Fokus diese Woche? #accountability #fitness",
    visibility: "public",
    likeCount: 89,
    commentCount: 42,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-post-3",
    authorId: "mock-creator-3",
    communityId: "mock-3",
    postType: "question",
    title: "Side Project Showcase",
    content:
      "Wer shippt diese Woche etwas? Postet euren Stack und was ihr als Nächstes baut.",
    visibility: "public",
    likeCount: 56,
    commentCount: 19,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-post-4",
    authorId: "mock-creator-4",
    communityId: "mock-4",
    postType: "event",
    title: "Deal Review Session",
    content:
      "Donnerstag 19:00 — Live-Analyse eines Off-Market Deals in Leipzig. Nur für Mitglieder.",
    visibility: "public",
    likeCount: 31,
    commentCount: 8,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-post-5",
    authorId: "mock-creator-1",
    communityId: "mock-5",
    postType: "poll",
    title: "Turnier-Format",
    content: "Welches Format für das nächste Community-Turnier? 1v1 oder Squad 3v3?",
    visibility: "public",
    likeCount: 210,
    commentCount: 65,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_COMMUNITY_NAMES: Record<string, { title: string; slug: string }> = {
  "mock-1": { title: "Creator Hub", slug: "creator-hub" },
  "mock-2": { title: "Fitness Mindset", slug: "fitness-mindset" },
  "mock-3": { title: "Dev Builders", slug: "dev-builders" },
  "mock-4": { title: "Immobilien Investment Club", slug: "immobilien-invest" },
  "mock-5": { title: "Gaming Legends DACH", slug: "gaming-legends" },
};

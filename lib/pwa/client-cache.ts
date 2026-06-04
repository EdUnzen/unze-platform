/** Client-seitiger PWA-Warmcache (localStorage). */

export const PWA_CACHE_KEYS = {
  prefetch: "unze:pwa:prefetch:v1",
  visitedSlugs: "unze:pwa:visited-slugs:v1",
} as const;

export type PwaPrefetchPayload = {
  fetchedAt: string;
  unreadCount: number;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  notifications: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  memberCommunities: Array<{ id: string; slug: string; title: string }>;
  upcomingEventCount: number;
};

export function readPwaPrefetchCache(): PwaPrefetchPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PWA_CACHE_KEYS.prefetch);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PwaPrefetchPayload;
    const age = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (age > 15 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePwaPrefetchCache(payload: PwaPrefetchPayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PWA_CACHE_KEYS.prefetch, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function trackVisitedCommunitySlug(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    const raw = localStorage.getItem(PWA_CACHE_KEYS.visitedSlugs);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 8);
    localStorage.setItem(PWA_CACHE_KEYS.visitedSlugs, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function readVisitedCommunitySlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PWA_CACHE_KEYS.visitedSlugs);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

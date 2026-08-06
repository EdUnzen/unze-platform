/**
 * Read-only oeffentliche Daten fuer die Landingpage.
 * Keine Dashboard-, Zahlungs-, Admin- oder Nutzer-Detaildaten.
 */
import { getCommunityBadges } from "@/services/badges/badge.service";
import { fetchCommunityBySlugFromDb } from "@/services/community/community.repository";
import { getDiscoverCommunitiesPreview } from "@/services/community/community.service";
import { fetchDiscoverGroups } from "@/services/community/group.repository";
import { getCommunityGroups } from "@/services/community/group.service";
import { fetchDiscoverEventsFromDb } from "@/services/events/event.repository";
import { getCommunityEventsListed } from "@/services/events/event-detail.service";
import { fetchCommunityReviewsFromDb } from "@/services/reviews/review.repository";
import type { Community, CommunityGroup } from "@/types/community";
import type { CommunityEvent } from "@/types/event";

export type PublicCommunityCard = Pick<
  Community,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "category"
  | "memberCount"
  | "rating"
  | "reviewCount"
  | "isVerified"
  | "isTrending"
  | "bannerGradient"
  | "bannerUrl"
  | "bannerPresetId"
>;

export type PublicEventCard = Pick<
  CommunityEvent,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "startsAt"
  | "location"
  | "communitySlug"
  | "communityTitle"
  | "isFeatured"
>;

export type PublicServiceCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  communitySlug: string;
  communityTitle: string;
  category: string;
  isVerified: boolean;
  memberCount: number;
  priceCents?: number | null;
};

export type PublicAwardPreview = {
  id: string;
  name: string;
  description: string | null;
  grantedCount: number;
};

export type PublicCommunityPreview = {
  community: PublicCommunityCard;
  events: CommunityEvent[];
  services: CommunityGroup[];
  groups: CommunityGroup[];
  reviews: Awaited<ReturnType<typeof fetchCommunityReviewsFromDb>>;
  awards: PublicAwardPreview[];
};

function toPublicCard(c: Community): PublicCommunityCard {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    memberCount: c.memberCount,
    rating: c.rating,
    reviewCount: c.reviewCount,
    isVerified: c.isVerified,
    isTrending: c.isTrending,
    bannerGradient: c.bannerGradient,
    bannerUrl: c.bannerUrl,
    bannerPresetId: c.bannerPresetId,
  };
}

function toPublicEvent(e: CommunityEvent): PublicEventCard {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt,
    location: e.location,
    communitySlug: e.communitySlug,
    communityTitle: e.communityTitle,
    isFeatured: e.isFeatured,
  };
}

function toPublicService(g: Awaited<ReturnType<typeof fetchDiscoverGroups>>[number]): PublicServiceCard {
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    description: g.description,
    communitySlug: g.communitySlug,
    communityTitle: g.communityTitle,
    category: g.category,
    isVerified: g.isVerified,
    memberCount: g.memberCount,
    priceCents: g.priceCents,
  };
}

/** Oeffentliche Communities mit optionaler Suche (Marketing) */
export async function searchPublicDirectoryCommunities(
  query: string,
  limit = 24,
): Promise<PublicCommunityCard[]> {
  const q = query.trim().toLowerCase();
  const rows = await getPublicDirectoryCommunities(100);
  if (!q) return rows.slice(0, limit);

  return rows
    .filter((c) => {
      const haystack = [c.title, c.description, c.category, c.slug].join(" ").toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}

/** Verzeichnis - nur oeffentliche Discover-Communities */
export async function getPublicDirectoryCommunities(
  limit = 48,
): Promise<PublicCommunityCard[]> {
  const rows = await getDiscoverCommunitiesPreview(limit);
  return rows.map(toPublicCard);
}

/** Oeffentliche Events ueber alle Communities */
export async function getPublicEventsDirectory(limit = 24): Promise<PublicEventCard[]> {
  const rows = await fetchDiscoverEventsFromDb(limit);
  return rows.map(toPublicEvent);
}

/** Oeffentliche Services ueber alle Communities */
export async function getPublicServicesDirectory(limit = 24): Promise<PublicServiceCard[]> {
  const rows = await fetchDiscoverGroups(limit, { groupType: "service" });
  return rows.map(toPublicService);
}

/** Community-Vorschau - read-only, kein User-Kontext */
export async function getPublicCommunityPreview(
  slug: string,
): Promise<PublicCommunityPreview | null> {
  const community = await fetchCommunityBySlugFromDb(slug, null, null);
  if (!community || community.visibility === "hidden" || community.visibility === "private") {
    return null;
  }

  const [events, groups, reviews, badges] = await Promise.all([
    getCommunityEventsListed(community.id, slug, 6),
    getCommunityGroups(community.id, slug),
    fetchCommunityReviewsFromDb(community.id).catch(() => []),
    getCommunityBadges(community.id).catch(() => []),
  ]);

  const services = groups.filter((g) => g.groupType === "service");
  const publicGroups = groups.filter((g) => g.groupType !== "service");

  return {
    community: toPublicCard(community),
    events,
    services,
    groups: publicGroups,
    reviews: reviews.slice(0, 5),
    awards: badges.slice(0, 8).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description ?? null,
      grantedCount: b.grantedCount ?? 0,
    })),
  };
}

/** Kategorien aus oeffentlichen Communities (fuer Filter) */
export async function getPublicDirectoryCategories(): Promise<string[]> {
  const communities = await getPublicDirectoryCommunities(100);
  const categories = new Set(
    communities.map((c) => c.category).filter(Boolean),
  );
  return ["Alle", ...Array.from(categories).sort((a, b) => a.localeCompare(b, "de"))];
}

export type PublicDirectoryStats = {
  communityCount: number;
  verifiedCount: number;
  totalMembers: number;
};

export async function getPublicDirectoryStats(): Promise<PublicDirectoryStats> {
  const communities = await getPublicDirectoryCommunities(100);
  return {
    communityCount: communities.length,
    verifiedCount: communities.filter((c) => c.isVerified).length,
    totalMembers: communities.reduce((sum, c) => sum + (c.memberCount ?? 0), 0),
  };
}

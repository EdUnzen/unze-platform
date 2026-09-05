import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { isDemoMode } from "@/lib/demo/mode";
import type { Community, CommunityFormInput } from "@/types/community";
import { enrichMockCommunity } from "@/services/community/demo-data";
import { MOCK_COMMUNITIES } from "@/services/community/community.mock";
import { getCurrentUser } from "@/services/auth/auth.service";
import { enableCreatorProfile } from "@/services/user/profile.service";
import {
  logCommunityCreateError,
  toUserCommunityCreateError,
} from "@/lib/errors/user-messages";
import { isValidCommunitySlug, slugifyTitle } from "@/lib/utils/slug";
import { ensureUserProfile } from "@/services/user/profile.service";
import { enrichCommunitiesWithEngagement } from "@/services/engagement/engagement.service";
import { enrichCommunitiesForViewer } from "./community.viewer-enrichment";
import { getCachedDiscoverList } from "@/lib/cache/data-cache";
import {
  createCommunityInDb,
  fetchCommunitiesByCreatorId,
  fetchCommunitiesFromDb,
  fetchCommunityBySlugFromDb,
  fetchCommunitiesByIds,
  isSlugAvailable,
  updateCommunityInDb,
} from "./community.repository";

export { formatMemberCount } from "@/lib/utils/format-metrics";

async function withViewerContext(communities: Community[]): Promise<Community[]> {
  if (communities.length === 0) return communities;
  try {
    const user = await getCurrentUser();
    const [enriched, withEngagement] = await Promise.all([
      user
        ? enrichCommunitiesForViewer(communities, user.id)
        : Promise.resolve(communities),
      enrichCommunitiesWithEngagement(communities, user?.id ?? null),
    ]);
    if (!user) return withEngagement;
    const engagementById = new Map(withEngagement.map((c) => [c.id, c.engagement]));
    return enriched.map((c) => ({
      ...c,
      engagement: engagementById.get(c.id) ?? c.engagement,
    }));
  } catch (error) {
    console.error("[community.service] discover viewer context:", error);
    return communities;
  }
}

function withDemoFallback(communities: Community[] | null): Community[] {
  if (communities && communities.length > 0) return communities;
  if (!isDemoMode()) return [];
  return MOCK_COMMUNITIES.map(enrichMockCommunity);
}

export async function getDiscoverCommunities(): Promise<Community[]> {
  const fromDb = await getCachedDiscoverList();
  return withViewerContext(withDemoFallback(fromDb));
}

/** Gast-Startseite — ohne Session/Engagement (schneller TTFB). */
export async function getDiscoverCommunitiesPreview(limit = 6): Promise<Community[]> {
  const fromDb = await getCachedDiscoverList();
  return withDemoFallback(fromDb).slice(0, limit);
}

export async function getFeaturedCommunities(): Promise<Community[]> {
  const fromDb = await fetchCommunitiesFromDb({
    trending: true,
    discover: true,
    limit: 10,
  });
  return withViewerContext(fromDb ?? []);
}

export async function getCommunityBySlug(
  slug: string,
  inviteCode?: string | null,
): Promise<Community | null> {
  const user = await getCurrentUser();
  let community = await fetchCommunityBySlugFromDb(
    slug,
    user?.id ?? null,
    inviteCode,
  );

  if (!community && (isDemoMode() || isDemoCommunitySlug(slug))) {
    const mock = MOCK_COMMUNITIES.find((c) => c.slug === slug);
    if (mock) community = enrichMockCommunity(mock);
  }

  if (!community) return null;
  return community;
}

export async function getFollowedCommunities(): Promise<Community[]> {
  const { getFollowedCommunityIds } = await import(
    "@/services/follow/follow.service"
  );
  const ids = await getFollowedCommunityIds();
  if (ids.length === 0) return [];

  const fromDb = await fetchCommunitiesByIds(ids);
  return withViewerContext(fromDb ?? []);
}

export async function getCreatorCommunities(
  creatorId: string,
): Promise<Community[]> {
  const fromDb = await fetchCommunitiesByCreatorId(creatorId);
  return fromDb ?? [];
}

export async function createCommunity(
  input: CommunityFormInput,
): Promise<{ community: Community | null; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { community: null, error: "Nicht angemeldet" };

  const slug = input.slug.trim().toLowerCase();
  if (!isValidCommunitySlug(slug)) {
    return { community: null, error: "Slug: 3–60 Zeichen, nur a-z, 0-9, -" };
  }

  const available = await isSlugAvailable(slug);
  if (!available) {
    return { community: null, error: "Dieser Slug ist bereits vergeben." };
  }

  const { error: profileError } = await ensureUserProfile(user);
  if (profileError) {
    console.error("[community.service] ensureUserProfile:", profileError.message);
    return {
      community: null,
      error:
        "Dein Profil konnte nicht vorbereitet werden. Bitte abmelden, erneut anmelden und nochmal versuchen.",
    };
  }

  const { error: creatorProfileError } = await enableCreatorProfile(user.id);
  if (creatorProfileError) {
    console.error("[community.service] enableCreatorProfile:", creatorProfileError.message);
  }

  const { resolveBannerFromPresetOrUrl } = await import(
    "@/lib/constants/category-banners"
  );
  const banner = resolveBannerFromPresetOrUrl({
    bannerUrl: input.bannerUrl,
    bannerPresetId: input.bannerPresetId,
    bannerGradient: input.bannerGradient,
    category: input.category,
  });

  const { community, error: createError } = await createCommunityInDb({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    platformType: input.platformType,
    category: input.category,
    tags: input.tags,
    focusTags: input.focusTags,
    visibility: input.visibility,
    bannerGradient: banner.gradient,
    bannerUrl: banner.imageUrl,
    externalUrl: input.externalUrl,
    discoverEnabled: input.discoverEnabled ?? true,
    creatorId: user.id,
  });

  if (!community) {
    logCommunityCreateError(createError ?? "unknown", { slug, userId: user.id });
    return { community: null, error: toUserCommunityCreateError(createError) };
  }

  const { ensureCreatorMembershipInDb } = await import(
    "./member.repository"
  );
  await ensureCreatorMembershipInDb(community.id, user.id);

  const { publishPlatformEvent } = await import(
    "@/services/platform/event-bus.service"
  );
  await publishPlatformEvent({
    eventType: "community.created",
    actorId: user.id,
    subjectType: "community",
    subjectId: community.id,
    communityId: community.id,
    payload: {
      slug: community.slug,
      communitySlug: community.slug,
      title: community.title,
      visibility: community.visibility,
    },
  });

  return { community, error: null };
}

export async function updateCommunity(
  communityId: string,
  input: Partial<CommunityFormInput>,
): Promise<{ community: Community | null; error: string | null }> {
  const banner =
    input.bannerUrl || input.bannerPresetId || input.bannerGradient
      ? (
          await import("@/lib/constants/category-banners")
        ).resolveBannerFromPresetOrUrl({
          bannerUrl: input.bannerUrl,
          bannerPresetId: input.bannerPresetId,
          bannerGradient: input.bannerGradient,
          category: input.category ?? "Allgemein",
        })
      : null;

  const community = await updateCommunityInDb(communityId, {
    title: input.title?.trim(),
    description: input.description?.trim(),
    platformType: input.platformType,
    category: input.category,
    tags: input.tags,
    focusTags: input.focusTags,
    visibility: input.visibility,
    bannerGradient: banner?.gradient ?? input.bannerGradient,
    bannerUrl: banner?.imageUrl ?? input.bannerUrl,
    externalUrl: input.externalUrl ?? null,
    discoverEnabled: input.discoverEnabled,
  });

  if (!community) {
    return { community: null, error: "Aktualisierung fehlgeschlagen." };
  }

  return { community, error: null };
}

export function suggestSlugFromTitle(title: string): string {
  return slugifyTitle(title);
}

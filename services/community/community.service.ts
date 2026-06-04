import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { isDemoMode } from "@/lib/demo/mode";
import type { Community, CommunityFormInput } from "@/types/community";
import { enrichMockCommunity } from "@/services/community/demo-data";
import { MOCK_COMMUNITIES } from "@/services/community/community.mock";
import { getCurrentUser } from "@/services/auth/auth.service";
import { enableCreatorProfile } from "@/services/user/profile.service";
import { isValidCommunitySlug, slugifyTitle } from "@/lib/utils/slug";
import { enrichCommunitiesWithEngagement } from "@/services/engagement/engagement.service";
import { enrichCommunitiesForViewer } from "./community.viewer-enrichment";
import {
  createCommunityInDb,
  fetchCommunitiesByCreatorId,
  fetchCommunitiesFromDb,
  fetchCommunityBySlugFromDb,
  fetchCommunitiesByIds,
  isSlugAvailable,
  updateCommunityInDb,
} from "./community.repository";

export function formatMemberCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

async function withViewerContext(communities: Community[]): Promise<Community[]> {
  try {
    const user = await getCurrentUser();
    let result = communities;
    if (user && communities.length > 0) {
      result = await enrichCommunitiesForViewer(communities, user.id);
    }
    return await enrichCommunitiesWithEngagement(result);
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
  const fromDb = await fetchCommunitiesFromDb({ discover: true, limit: 50 });
  return withViewerContext(withDemoFallback(fromDb));
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

  await enableCreatorProfile(user.id);

  const community = await createCommunityInDb({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    platformType: input.platformType,
    category: input.category,
    tags: input.tags,
    focusTags: input.focusTags,
    visibility: input.visibility,
    bannerGradient: input.bannerGradient,
    externalUrl: input.externalUrl,
    discoverEnabled: input.discoverEnabled ?? true,
    creatorId: user.id,
  });

  if (!community) {
    return {
      community: null,
      error:
        "Community konnte nicht erstellt werden. Bitte Migration 026 ausführen oder erneut versuchen.",
    };
  }

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
  const community = await updateCommunityInDb(communityId, {
    title: input.title?.trim(),
    description: input.description?.trim(),
    platformType: input.platformType,
    category: input.category,
    tags: input.tags,
    focusTags: input.focusTags,
    visibility: input.visibility,
    bannerGradient: input.bannerGradient,
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

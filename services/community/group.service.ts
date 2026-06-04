import { isDemoCommunitySlug } from "@/lib/constants/demo";
import { mapGroupToDiscoverCard } from "@/lib/community/map-discover-group";
import { getDemoGroups } from "@/services/community/demo-data";
import type { CommunityGroup, DiscoverGroup } from "@/types/community";
import {
  createGroupInDb,
  deleteGroupInDb,
  fetchDiscoverGroups,
  fetchGroupBySlugsFromDb,
  fetchGroupsByCommunityId,
  updateGroupInDb,
} from "./group.repository";
import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";
import { buildGroupCardEngagement } from "@/services/engagement/engagement.service";
import { getGroupVisual } from "@/lib/demo/group-visuals";

export async function getCommunityGroups(
  communityId: string,
  communitySlug?: string,
): Promise<CommunityGroup[]> {
  const fromDb = await fetchGroupsByCommunityId(communityId);
  if (fromDb.length > 0) return fromDb;
  if (communitySlug && isDemoCommunitySlug(communitySlug)) {
    return getDemoGroups(communitySlug);
  }
  return fromDb;
}

export async function getDiscoverGroups(
  limit = 24,
  options?: { groupType?: "group" | "service" },
): Promise<DiscoverGroup[]> {
  const groups = await fetchDiscoverGroups(limit, options);
  if (groups.length === 0) return groups;

  const communityIds = [...new Set(groups.map((g) => g.communityId))];
  let stats: Awaited<ReturnType<typeof getCommunityActivityStats>> = {};
  try {
    stats = await getCommunityActivityStats(communityIds);
  } catch (error) {
    console.error("[group.service] discover activity stats:", error);
  }

  return groups.map((group) => {
    const visual = getGroupVisual(group.communitySlug, group.slug);
    const engagement = buildGroupCardEngagement({
      communitySlug: group.communitySlug,
      groupSlug: group.slug,
      isTrending: group.isTrending,
      weeklyViews: group.viewCountWeekly,
      shareCount: group.shareCount,
      weeklyPostCount: stats[group.communityId]?.weeklyPostCount,
      activityLabel: visual?.activityLabel,
    });
    return {
      ...group,
      weeklyPostCount: stats[group.communityId]?.weeklyPostCount ?? 0,
      engagement,
    };
  });
}

export async function getGroupBySlugs(
  communitySlug: string,
  groupSlug: string,
): Promise<DiscoverGroup | null> {
  const fromDb = await fetchGroupBySlugsFromDb(communitySlug, groupSlug);
  if (fromDb) return fromDb;

  if (!isDemoCommunitySlug(communitySlug)) return null;

  const group = getDemoGroups(communitySlug).find(
    (g) => g.slug === groupSlug && g.isPublic !== false,
  );
  if (!group) return null;

  const { getCommunityBySlug } = await import("@/services/community/community.service");
  const community = await getCommunityBySlug(communitySlug);
  if (!community) return null;

  return mapGroupToDiscoverCard(community, group);
}

export async function createCommunityGroup(input: {
  communityId: string;
  slug: string;
  title: string;
  description: string;
  isPublic?: boolean;
  groupType?: "group" | "service";
  priceCents?: number | null;
  coverUrl?: string | null;
}) {
  const { createClient } = await import("@/lib/supabase/server");
  const { getDefaultBannerPresetForCategory } = await import(
    "@/lib/constants/category-banners"
  );
  const supabase = await createClient();
  let coverUrl = input.coverUrl ?? null;

  if (!coverUrl && supabase) {
    const { data: community } = await supabase
      .from("communities")
      .select("category, banner_url")
      .eq("id", input.communityId)
      .maybeSingle();
    coverUrl =
      (community?.banner_url as string | null) ??
      getDefaultBannerPresetForCategory(
        (community?.category as string) ?? "Allgemein",
      ).imageUrl;
  }

  const group = await createGroupInDb({ ...input, coverUrl });
  if (group) {
    const { fetchCommunityTitleById } = await import("./community.repository");
    const communityTitle = await fetchCommunityTitleById(input.communityId);
    const { publishPlatformEvent } = await import(
      "@/services/platform/event-bus.service"
    );
    const eventType =
      (input.groupType ?? "group") === "service"
        ? "community.service_created"
        : "community.group_created";
    await publishPlatformEvent({
      eventType,
      communityId: input.communityId,
      subjectType: "group",
      subjectId: group.id,
      payload: {
        groupTitle: input.title,
        communityTitle: communityTitle ?? "",
      },
    });
  }
  return group;
}

export async function updateCommunityGroup(
  groupId: string,
  input: Parameters<typeof updateGroupInDb>[1],
) {
  return updateGroupInDb(groupId, input);
}

export async function deleteCommunityGroup(groupId: string) {
  return deleteGroupInDb(groupId);
}

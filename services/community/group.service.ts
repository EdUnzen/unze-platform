import type { CommunityGroup, DiscoverGroup } from "@/types/community";
import {
  createGroupInDb,
  deleteGroupInDb,
  fetchDiscoverGroups,
  fetchGroupsByCommunityId,
  updateGroupInDb,
} from "./group.repository";
import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";
import { buildGroupCardEngagement } from "@/services/engagement/engagement.service";
import { getGroupVisual } from "@/lib/demo/group-visuals";

export async function getCommunityGroups(
  communityId: string,
): Promise<CommunityGroup[]> {
  return fetchGroupsByCommunityId(communityId);
}

export async function getDiscoverGroups(
  limit = 24,
  options?: { groupType?: "group" | "service" },
): Promise<DiscoverGroup[]> {
  const groups = await fetchDiscoverGroups(limit, options);
  if (groups.length === 0) return groups;

  const communityIds = [...new Set(groups.map((g) => g.communityId))];
  const stats = await getCommunityActivityStats(communityIds);

  return Promise.all(
    groups.map(async (group) => {
      const visual = getGroupVisual(group.communitySlug, group.slug);
      const engagement = await buildGroupCardEngagement({
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
    }),
  );
}

export async function createCommunityGroup(input: {
  communityId: string;
  slug: string;
  title: string;
  description: string;
  isPublic?: boolean;
}) {
  return createGroupInDb(input);
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

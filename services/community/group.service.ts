import type { CommunityGroup, DiscoverGroup } from "@/types/community";
import {
  createGroupInDb,
  deleteGroupInDb,
  fetchDiscoverGroups,
  fetchGroupsByCommunityId,
  updateGroupInDb,
} from "./group.repository";
import { getCommunityActivityStats } from "@/services/platform/activity-stats.service";

export async function getCommunityGroups(
  communityId: string,
): Promise<CommunityGroup[]> {
  return fetchGroupsByCommunityId(communityId);
}

export async function getDiscoverGroups(limit = 24): Promise<DiscoverGroup[]> {
  const groups = await fetchDiscoverGroups(limit);
  if (groups.length === 0) return groups;

  const communityIds = [...new Set(groups.map((g) => g.communityId))];
  const stats = await getCommunityActivityStats(communityIds);

  return groups.map((group) => ({
    ...group,
    weeklyPostCount: stats[group.communityId]?.weeklyPostCount ?? 0,
  }));
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

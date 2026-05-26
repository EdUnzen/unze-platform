import type { CommunityGroup, DiscoverGroup } from "@/types/community";
import {
  createGroupInDb,
  deleteGroupInDb,
  fetchDiscoverGroups,
  fetchGroupsByCommunityId,
  updateGroupInDb,
} from "./group.repository";

export async function getCommunityGroups(
  communityId: string,
): Promise<CommunityGroup[]> {
  return fetchGroupsByCommunityId(communityId);
}

export async function getDiscoverGroups(limit = 24): Promise<DiscoverGroup[]> {
  return fetchDiscoverGroups(limit);
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

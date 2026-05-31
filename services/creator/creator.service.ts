import type { Community, DiscoverGroup } from "@/types/community";
import type { PlatformCreator } from "@/types/creator";
import {
  fetchCreatorByIdFromDb,
  fetchCreatorByUsernameFromDb,
  fetchCreatorCommunitiesFromDb,
  fetchCreatorPublicGroupsFromDb,
  fetchDiscoverCreatorsFromDb,
} from "./creator.repository";

export interface CreatorPublicProfile {
  creator: PlatformCreator;
  communities: Community[];
  groups: DiscoverGroup[];
}

export async function getDiscoverCreators(limit = 20): Promise<PlatformCreator[]> {
  return fetchDiscoverCreatorsFromDb(limit);
}

export async function getCreatorById(
  creatorId: string,
): Promise<PlatformCreator | null> {
  return fetchCreatorByIdFromDb(creatorId);
}

export async function getCreatorByUsername(
  username: string,
): Promise<PlatformCreator | null> {
  return fetchCreatorByUsernameFromDb(username);
}

export async function getCreatorPublicProfile(
  username: string,
): Promise<CreatorPublicProfile | null> {
  const creator = await fetchCreatorByUsernameFromDb(username);
  if (!creator) return null;

  const [communities, groups] = await Promise.all([
    fetchCreatorCommunitiesFromDb(creator.id),
    fetchCreatorPublicGroupsFromDb(creator.id),
  ]);

  return { creator, communities, groups };
}

export function getCreatorProfilePath(creator: {
  username: string | null;
  id: string;
}): string | null {
  if (creator.username) {
    return `/creator/${encodeURIComponent(creator.username.toLowerCase())}`;
  }
  return null;
}

import type { UserAwardView } from "@/services/badges/badge.repository";
import type { CreatorNetworkReview, PlatformCreator } from "@/types/creator";
import type { Community, DiscoverGroup } from "@/types/community";
import {
  fetchCreatorByIdFromDb,
  fetchCreatorByUsernameFromDb,
  fetchCreatorCommunitiesFromDb,
  fetchCreatorNetworkReviewsFromDb,
  fetchCreatorPublicGroupsFromDb,
  fetchDiscoverCreatorsFromDb,
} from "./creator.repository";
import { getPublicUserAwards } from "@/services/badges/badge.service";

export interface CreatorPublicProfile {
  creator: PlatformCreator;
  communities: Community[];
  groups: DiscoverGroup[];
  reviews: CreatorNetworkReview[];
  publicAwards: UserAwardView[];
}

async function loadCreatorPublicProfile(
  creator: PlatformCreator,
): Promise<CreatorPublicProfile> {
  const [communities, groups, reviews, publicAwards] = await Promise.all([
    fetchCreatorCommunitiesFromDb(creator.id),
    fetchCreatorPublicGroupsFromDb(creator.id),
    fetchCreatorNetworkReviewsFromDb(creator.id),
    getPublicUserAwards(creator.id),
  ]);

  return { creator, communities, groups, reviews, publicAwards };
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
  return loadCreatorPublicProfile(creator);
}

export async function getCreatorPublicProfileById(
  creatorId: string,
): Promise<CreatorPublicProfile | null> {
  const creator = await fetchCreatorByIdFromDb(creatorId);
  if (!creator) return null;
  return loadCreatorPublicProfile(creator);
}

export function getCreatorProfilePath(creator: {
  username: string | null;
  id: string;
}): string {
  if (creator.username) {
    return `/creator/${encodeURIComponent(creator.username.toLowerCase())}`;
  }
  return `/creator/id/${creator.id}`;
}

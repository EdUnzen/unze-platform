import { getFollowedCommunities } from "@/services/community/community.service";
import { getUpcomingEventsForCommunities } from "@/services/events/event.service";
import { getFollowedGroups } from "@/services/follow/follow.service";
import type { Community } from "@/types/community";
import type { CommunityEvent } from "@/types/event";
import type { DiscoverGroup } from "@/types/community";

export type FavoritesBundle = {
  communities: Community[];
  groups: DiscoverGroup[];
  services: DiscoverGroup[];
  events: CommunityEvent[];
};

/** Favoriten = gefolgte Communities/Gruppen + Events aus gefolgten Communities */
export async function getFavoritesBundle(): Promise<FavoritesBundle> {
  const [communities, followedGroups] = await Promise.all([
    getFollowedCommunities(),
    getFollowedGroups(),
  ]);

  const groups = followedGroups.filter((g) => g.groupType !== "service");
  const services = followedGroups.filter((g) => g.groupType === "service");

  const communityIds = [
    ...new Set([
      ...communities.map((c) => c.id),
      ...followedGroups.map((g) => g.communityId),
    ]),
  ];

  const events =
    communityIds.length > 0
      ? await getUpcomingEventsForCommunities(communityIds, 12)
      : [];

  return { communities, groups, services, events };
}

export function hasAnyFavorites(bundle: FavoritesBundle): boolean {
  return (
    bundle.communities.length > 0 ||
    bundle.groups.length > 0 ||
    bundle.services.length > 0 ||
    bundle.events.length > 0
  );
}
